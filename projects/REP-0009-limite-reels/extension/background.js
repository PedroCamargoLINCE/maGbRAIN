import { normalizeState, platformFor, remainingMs, settle, validateLimits } from "./core.js";

// Serialize all tabs, popup actions and focus events to avoid lost updates.
let queue = Promise.resolve();
function serial(task) {
  const result = queue.then(task);
  queue = result.catch((error) => console.warn("Short Pause:", error.message));
  return result;
}

async function update(message = {}, sender = {}) {
  const now = Date.now();
  const [{ state: raw }, { sample }] = await Promise.all([
    chrome.storage.local.get("state"), chrome.storage.session.get("sample"),
  ]);
  const state = normalizeState(raw, now);
  settle(state, sample, now);
  let next = sample ? { ...sample, at: now } : null;
  let platform = null;

  if (message.type === "pulse") {
    const tab = await chrome.tabs.get(sender.tab.id);
    // The browser's tab URL is authoritative, including SPA navigation.
    platform = platformFor(tab.url || sender.url);
    const window = await chrome.windows.get(tab.windowId);
    const eligible = platform && tab.active && window.focused && message.visible && message.focused;
    if (eligible && remainingMs(state, platform) > 0) {
      next = { tabId: tab.id, platform, at: now, lastSeen: now };
    } else if (next?.tabId === tab.id) {
      next = null;
    }
  } else if (message.type === "boundary") {
    next = null;
  } else if (message.type === "save") {
    state.limitsMinutes = validateLimits(message.limits);
  }

  if (JSON.stringify(state) !== JSON.stringify(raw)) await chrome.storage.local.set({ state });
  await chrome.storage.session.set({ sample: next });
  return { state, platform, blocked: platform ? remainingMs(state, platform) === 0 : false };
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  const fromPopup = sender.id === chrome.runtime.id && sender.url === chrome.runtime.getURL("popup.html");
  if (!(message?.type === "pulse" && sender.tab && sender.frameId === 0) &&
      !(fromPopup && ["snapshot", "save"].includes(message?.type))) return;
  serial(() => update(message, sender)).then(respond, (error) => respond({ error: error.message }));
  return true;
});

const boundary = () => { serial(() => update({ type: "boundary" })); };
chrome.tabs.onActivated.addListener(boundary);
chrome.tabs.onRemoved.addListener(boundary);
chrome.windows.onFocusChanged.addListener(boundary);
chrome.tabs.onUpdated.addListener((tabId, changes) => {
  if (changes.url || changes.status === "loading") {
    serial(async () => {
      const { sample } = await chrome.storage.session.get("sample");
      if (sample?.tabId === tabId) await update({ type: "boundary" });
    });
  }
});
chrome.runtime.onInstalled.addListener(boundary);
chrome.runtime.onStartup.addListener(boundary);
