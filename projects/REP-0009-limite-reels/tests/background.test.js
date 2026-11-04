import test from "node:test";
import assert from "node:assert/strict";
import { registerBackground } from "../extension/background.js";
import { localDay } from "../extension/core.js";

function harness(os, withWindows = true) {
  let now = new Date(2026, 10, 4, 12).getTime();
  const data = { state: { day: localDay(now), limitsMinutes: { reels: 1, shorts: 1, tiktok: 1 }, usageMs: { reels: 0, shorts: 0, tiktok: 0 } } };
  const session = {};
  const event = () => ({ listeners: [], addListener(fn) { this.listeners.push(fn); } });
  const storage = (values) => ({ async get(key) { return structuredClone({ [key]: values[key] }); }, async set(update) { Object.assign(values, structuredClone(update)); } });
  const tab = { id: 1, active: true, windowId: 1, url: "https://m.youtube.com/shorts/mobile" };
  const window = { focused: true };
  const api = {
    runtime: { id: "test", getURL: (path) => `chrome-extension://test/${path}`, getPlatformInfo: async () => ({ os }), onMessage: event(), onInstalled: event(), onStartup: event() },
    tabs: { get: async () => ({ ...tab }), onActivated: event(), onRemoved: event(), onUpdated: event() },
    storage: { local: storage(data), session: storage(session) },
  };
  if (withWindows) api.windows = { get: async () => ({ ...window }), onFocusChanged: event() };
  registerBackground(api, () => now);
  const send = (message, sender = { tab, frameId: 0, url: tab.url }) => new Promise((resolve) => {
    const accepted = api.runtime.onMessage.listeners[0](message, sender, resolve);
    if (!accepted) resolve(undefined);
  });
  return { api, data, session, tab, window, advance: (ms) => { now += ms; },
    pulse: (extra = {}) => send({ type: "pulse", visible: true, focused: true, ...extra }),
    popup: (message) => send(message, { id: "test", url: api.runtime.getURL("popup.html") }), send };
}

test("Android worker registers without windows and blocks at the daily budget", async () => {
  const h = harness("android", false);
  h.data.state.usageMs.shorts = 59000;
  assert.equal((await h.pulse()).blocked, false);
  h.advance(1000);
  assert.equal((await h.pulse()).blocked, true);
  assert.equal(h.data.state.usageMs.shorts, 60000);
  assert.equal(h.session.sample, null);
});

test("Android never invokes unsupported windows methods, even if stubs exist", async () => {
  const h = harness("android");
  h.api.windows.get = () => { throw new Error("Unsupported on Android"); };
  assert.equal((await h.pulse()).platform, "shorts");
  h.advance(1000);
  await h.pulse();
  assert.equal(h.data.state.usageMs.shorts, 1000);
});

test("Android hidden, unfocused and inactive pages do not keep counting", async () => {
  for (const condition of ["hidden", "unfocused", "inactive"]) {
    const h = harness("android", false);
    await h.pulse();
    h.advance(500);
    if (condition === "inactive") h.tab.active = false;
    const extra = condition === "hidden" ? { visible: false } : condition === "unfocused" ? { focused: false } : {};
    await h.pulse(extra);
    assert.equal(h.session.sample, null);
    h.advance(1000);
    await h.pulse(extra);
    assert.equal(h.data.state.usageMs.shorts, 500, condition);
  }
});

test("Android resume discards time while backgrounded and keeps budgets", async () => {
  const h = harness("android", false);
  await h.pulse();
  h.advance(120000);
  await h.pulse();
  assert.equal(h.data.state.usageMs.shorts, 0);
  h.advance(1000);
  await h.pulse();
  assert.equal(h.data.state.usageMs.shorts, 1000);
  const saved = await h.popup({ type: "save", limits: { reels: 2, shorts: 0, tiktok: 3 } });
  assert.equal(saved.state.usageMs.shorts, 1000);
  assert.equal((await h.pulse()).blocked, true);
});

test("desktop still enforces focused-window eligibility", async () => {
  const h = harness("linux");
  h.window.focused = false;
  await h.pulse();
  h.advance(1000);
  await h.pulse();
  assert.equal(h.data.state.usageMs.shorts, 0);
  h.window.focused = true;
  await h.pulse();
  h.advance(1000);
  await h.pulse();
  assert.equal(h.data.state.usageMs.shorts, 1000);
});
