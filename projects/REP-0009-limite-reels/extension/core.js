export const PLATFORMS = Object.freeze({
  reels: "Reels", shorts: "YouTube Shorts", tiktok: "TikTok",
});
export const DEFAULT_MINUTES = 15;
export const MAX_SAMPLE_GAP_MS = 2000;

export function platformFor(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return null;
    const host = url.hostname;
    const on = (domain) => host === domain || host.endsWith(`.${domain}`);
    if (on("tiktok.com")) return "tiktok";
    if (on("youtube.com") && /^\/shorts(?:\/|$)/i.test(url.pathname)) return "shorts";
    if ((on("instagram.com") || on("facebook.com")) && /^\/reels?(?:\/|$)/i.test(url.pathname)) return "reels";
    return null;
  } catch { return null; }
}

export function localDay(now) {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function normalizeState(raw = {}, now = Date.now()) {
  const day = localDay(now);
  const state = { day, limitsMinutes: {}, usageMs: {} };
  for (const key of Object.keys(PLATFORMS)) {
    const limit = raw?.limitsMinutes?.[key];
    const used = raw?.usageMs?.[key];
    state.limitsMinutes[key] = Number.isInteger(limit) && limit >= 0 && limit <= 1440 ? limit : DEFAULT_MINUTES;
    state.usageMs[key] = raw?.day === day && Number.isFinite(used) && used >= 0 ? used : 0;
  }
  return state;
}

// Only a short, recent sampling interval is counted. Suspended tabs/OS sleep
// cannot turn a stale sample into hours of usage. Split at local midnight.
export function settle(state, sample, now) {
  if (!sample || !Object.hasOwn(PLATFORMS, sample.platform)) return;
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const start = Math.max(sample.at, midnight.getTime());
  const elapsed = now - sample.at;
  if (elapsed < 0 || now - (sample.lastSeen ?? sample.at) > MAX_SAMPLE_GAP_MS) return;
  state.usageMs[sample.platform] += Math.max(0, now - start);
}

export function remainingMs(state, key) {
  return Math.max(0, state.limitsMinutes[key] * 60000 - state.usageMs[key]);
}

export function validateLimits(limits) {
  if (!limits || Object.keys(limits).length !== Object.keys(PLATFORMS).length ||
      !Object.keys(PLATFORMS).every((key) => Number.isInteger(limits[key]) && limits[key] >= 0 && limits[key] <= 1440)) {
    throw new Error("Enter whole minutes from 0 to 1440 for every platform.");
  }
  return Object.fromEntries(Object.keys(PLATFORMS).map((key) => [key, limits[key]]));
}
