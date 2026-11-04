import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

// Use an installed Chrome/Edge binary. No browser or site API is mocked: only
// network responses are replaced with reproducible, account-free feed fixtures.
const executablePath = process.env.BROWSER_PATH;
if (!executablePath) throw new Error("Set BROWSER_PATH to a Chrome or Edge executable.");
const label = process.env.BROWSER_LABEL || "browser";
const profile = await mkdtemp(`${tmpdir()}/short-pause-${label}-`);
await mkdir("test-results", { recursive: true });
const extension = resolve("extension");
const errors = [];
let context;
let worker;
let extensionId;
const fixture = `<!doctype html><html><head><title>Feed fixture</title></head><body>
<h1>Feed fixture</h1><button id="ordinary">Ordinary site control</button><video muted autoplay playsinline></video>
<script>const canvas=document.createElement('canvas'); canvas.width=160; canvas.height=90;
const paint=canvas.getContext('2d'); setInterval(()=>{paint.fillStyle='green';paint.fillRect(0,0,160,90)},100);
document.querySelector('video').srcObject=canvas.captureStream(10);</script></body></html>`;

async function start() {
  context = await chromium.launchPersistentContext(profile, {
    executablePath, headless: true,
    args: ["--no-sandbox", "--enable-unsafe-extension-debugging", "--autoplay-policy=no-user-gesture-required"],
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const cdp = await context.browser().newBrowserCDPSession();
  ({ id: extensionId } = await cdp.send("Extensions.loadUnpacked", { path: extension }));
  worker = context.serviceWorkers().find((w) => w.url().startsWith(`chrome-extension://${extensionId}/`)) ||
    await context.waitForEvent("serviceworker", { timeout: 15000 });
  await context.route("https://**/*", (route) => route.fulfill({ contentType: "text/html", body: fixture }));
  context.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
  console.log(`${label}: ${context.browser().version()} installed ${extensionId}`);
}
async function check(description, task) {
  await task();
  console.log(`PASS ${description}`);
}
async function state() { return worker.evaluate(async () => (await chrome.storage.local.get("state")).state); }
async function seed({ limits = { reels: 15, shorts: 15, tiktok: 15 }, usage = {}, day } = {}) {
  await worker.evaluate(async ({ limits, usage, day }) => {
    const now = new Date();
    day ??= `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    await chrome.storage.session.set({ sample: null });
    await chrome.storage.local.set({ state: { day, limitsMinutes: limits, usageMs: { reels: 0, shorts: 0, tiktok: 0, ...usage } } });
  }, { limits, usage, day });
}
async function eventually(predicate, message, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}
async function isBlocked(page) { return await page.locator("short-pause-limit").count() === 1; }

try {
  await start();
  const page = await context.newPage();
  await page.goto("https://www.youtube.com/watch?v=normal");
  await page.bringToFront();
  await check("ordinary YouTube videos remain usable", async () => {
    await seed();
    await page.waitForTimeout(1200);
    assert.equal(await isBlocked(page), false);
    assert.equal((await state()).usageMs.shorts, 0);
    await page.locator("#ordinary").click();
  });
  await check("SPA entry counts focused Shorts and blocks/pauses at the daily limit", async () => {
    await seed({ limits: { reels: 15, shorts: 1, tiktok: 15 }, usage: { shorts: 58500 } });
    await page.evaluate(() => history.pushState({}, "", "/shorts/demo"));
    await eventually(() => isBlocked(page), "Shorts did not block");
    assert.equal(await page.locator("video").evaluate((v) => v.paused), true);
    await page.locator("video").evaluate((v) => v.play().catch(() => {}));
    assert.equal(await page.locator("video").evaluate((v) => v.paused), true);
    await page.locator("short-pause-limit").evaluate((overlay) => overlay.remove());
    await eventually(() => isBlocked(page), "Site rerender removed the blocker permanently");
    await page.screenshot({ path: `test-results/${label}-blocked.png` });
  });
  await check("SPA exit removes the blocker", async () => {
    await page.evaluate(() => history.pushState({}, "", "/watch?v=normal"));
    await eventually(async () => !(await isBlocked(page)), "Normal video stayed blocked");
    await page.locator("#ordinary").click();
  });
  await check("all supported feeds block at zero, including shared Instagram/Facebook Reels", async () => {
    await seed({ limits: { reels: 0, shorts: 0, tiktok: 0 } });
    for (const url of ["https://www.instagram.com/reel/123/", "https://www.facebook.com/reels/123", "https://www.tiktok.com/@demo/video/123"]) {
      await page.goto(url);
      await eventually(() => isBlocked(page), `${url} did not block`);
      assert.equal(await page.locator("video").evaluate((v) => v.paused), true);
    }
    await page.goto("https://www.instagram.com/direct/inbox/");
    await page.waitForTimeout(1200);
    assert.equal(await isBlocked(page), false);
  });
  await check("only the foreground tab counts; simultaneous tabs do not double count", async () => {
    await seed();
    await page.goto("https://www.youtube.com/shorts/one");
    const second = await context.newPage();
    await second.goto("https://www.youtube.com/shorts/two");
    await second.bringToFront();
    await second.waitForTimeout(1200);
    const start = Date.now();
    const before = (await state()).usageMs.shorts;
    await second.waitForTimeout(3200);
    const delta = (await state()).usageMs.shorts - before;
    assert.ok(delta >= 1800 && delta < Date.now() - start + 1200, `Unexpected multi-tab usage ${delta}ms`);
    await second.goto("https://example.test/");
    await second.waitForTimeout(1200);
    const stopped = (await state()).usageMs.shorts;
    await second.waitForTimeout(2300);
    assert.equal((await state()).usageMs.shorts, stopped);
    await second.close();
  });
  await check("local midnight rollover unblocks a previously exhausted feed", async () => {
    await seed({ day: "2000-01-01", usage: { shorts: 900000 } });
    await page.bringToFront();
    await eventually(async () => (await state()).day !== "2000-01-01", "Day did not reset");
    assert.ok((await state()).usageMs.shorts < 5000);
    await eventually(async () => !(await isBlocked(page)), "Rollover did not unblock");
  });
  await check("a stale service-worker sample cannot charge time spent suspended", async () => {
    await seed();
    await worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      await chrome.storage.session.set({ sample: { tabId: tab.id, platform: "shorts", at: Date.now() - 60000, lastSeen: Date.now() - 60000 } });
    });
    await page.waitForTimeout(1200);
    assert.ok((await state()).usageMs.shorts < 3000);
  });
  await check("real popup saves settings, validates input and keeps today's usage", async () => {
    await seed({ usage: { reels: 12345 } });
    const popup = await context.newPage();
    await popup.setViewportSize({ width: 380, height: 600 });
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.bringToFront();
    await eventually(async () => await popup.locator("#reels").inputValue() === "15", "Popup failed to load");
    await popup.locator("#reels").fill("7");
    await popup.locator("#shorts").fill("0");
    await popup.locator("#tiktok").fill("8");
    await popup.locator("#save").click();
    await eventually(async () => (await popup.locator("#status").textContent()).startsWith("Saved"), "Popup failed to save");
    assert.deepEqual((await state()).limitsMinutes, { reels: 7, shorts: 0, tiktok: 8 });
    assert.equal((await state()).usageMs.reels, 12345);
    assert.ok(await popup.evaluate(() => document.body.scrollHeight <= 600), "Popup exceeds browser's 600px height limit");
    await popup.screenshot({ path: `test-results/${label}-popup.png` });
    await popup.locator("#reels").fill("-1");
    await popup.locator("#save").click();
    assert.equal((await state()).limitsMinutes.reels, 7);
    await popup.close();
    await page.bringToFront();
    await eventually(() => isBlocked(page), "Saved zero limit did not apply to existing tab");
  });
  await check("settings and usage survive a browser restart", async () => {
    const before = await state();
    await context.close();
    await start();
    assert.deepEqual((await state()).limitsMinutes, before.limitsMinutes);
    assert.deepEqual((await state()).usageMs, before.usageMs);
    const restored = await context.newPage();
    await restored.goto("https://www.youtube.com/shorts/after-restart");
    await eventually(() => isBlocked(restored), "Restart lost blocking");
  });
  assert.deepEqual(errors, [], "Unexpected page errors");
  console.log(`${label}: all browser checks passed`);
} finally {
  await context?.close();
  await rm(profile, { recursive: true, force: true });
}
