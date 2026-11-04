import test from "node:test";
import assert from "node:assert/strict";
import { platformFor, normalizeState, localDay, settle, remainingMs, validateLimits } from "../extension/core.js";

test("classifies supported routes without matching unrelated sites or normal videos", () => {
  for (const [url, expected] of [
    ["https://www.instagram.com/reels/abc/", "reels"],
    ["https://www.instagram.com/reel/abc/?x=1", "reels"],
    ["https://m.facebook.com/reel/123", "reels"],
    ["https://www.facebook.com/reels", "reels"],
    ["https://www.youtube.com/shorts/xyz", "shorts"],
    ["https://m.youtube.com/shorts", "shorts"],
    ["https://www.tiktok.com/@name/video/12", "tiktok"],
    ["https://www.tiktok.com/", "tiktok"],
    ["https://www.youtube.com/watch?v=abc", null],
    ["https://www.instagram.com/direct/inbox/", null],
    ["https://www.facebook.com/", null],
    ["https://youtube.com.evil.test/shorts/x", null],
    ["https://notyoutube.com/shorts/x", null],
    ["https://www.youtube.com/shortstuff", null],
    ["http://www.youtube.com/shorts/x", null],
    ["not a URL", null],
  ]) assert.equal(platformFor(url), expected, url);
});

test("new install defaults, corrupt values and daily rollover", () => {
  const now = new Date(2026, 10, 4, 12).getTime();
  const state = normalizeState({ day: localDay(now), limitsMinutes: { reels: 0, shorts: -1, tiktok: 30 }, usageMs: { reels: 42, shorts: NaN } }, now);
  assert.deepEqual(state.limitsMinutes, { reels: 0, shorts: 15, tiktok: 30 });
  assert.deepEqual(state.usageMs, { reels: 42, shorts: 0, tiktok: 0 });
  const tomorrow = normalizeState(state, new Date(2026, 10, 5, 0).getTime());
  assert.deepEqual(tomorrow.usageMs, { reels: 0, shorts: 0, tiktok: 0 });
  assert.deepEqual(tomorrow.limitsMinutes, state.limitsMinutes);
  assert.equal(normalizeState(null, now).limitsMinutes.shorts, 15);
});

test("accounts elapsed time once, blocks exactly at limit, retains usage when limits change", () => {
  const now = new Date(2026, 10, 4, 12).getTime();
  const state = normalizeState({}, now);
  state.limitsMinutes.shorts = 1;
  state.usageMs.shorts = 59000;
  settle(state, { platform: "shorts", at: now - 1000 }, now);
  assert.equal(remainingMs(state, "shorts"), 0);
  state.limitsMinutes.shorts = 2;
  assert.equal(remainingMs(state, "shorts"), 60000);
  settle(state, { platform: "shorts", at: now }, now);
  assert.equal(state.usageMs.shorts, 60000);
});

test("ignores sleeping tabs, reversed clocks and expired heartbeats even after snapshot", () => {
  const now = new Date(2026, 10, 4, 12).getTime();
  const state = normalizeState({}, now);
  for (const sample of [null, { platform: "other", at: now - 500 },
    { platform: "reels", at: now - 300000 }, { platform: "reels", at: now + 1 },
    { platform: "reels", at: now - 500, lastSeen: now - 300000 }]) settle(state, sample, now);
  assert.equal(state.usageMs.reels, 0);
});

test("interval crossing midnight charges only the new day's portion", () => {
  const now = new Date(2026, 10, 5, 0, 0, 0, 400).getTime();
  const state = normalizeState({}, now);
  settle(state, { platform: "tiktok", at: now - 1000 }, now);
  assert.equal(state.usageMs.tiktok, 400);
});

test("settings reject partial, fractional, negative, nonnumeric and excessive limits", () => {
  const valid = { reels: 0, shorts: 15, tiktok: 1440 };
  assert.deepEqual(validateLimits(valid), valid);
  for (const invalid of [null, {}, { ...valid, shorts: "15" }, { ...valid, reels: -1 },
    { ...valid, reels: 1.5 }, { ...valid, tiktok: 1441 }, { ...valid, extra: 1 }]) {
    assert.throws(() => validateLimits(invalid), /whole minutes/);
  }
});
