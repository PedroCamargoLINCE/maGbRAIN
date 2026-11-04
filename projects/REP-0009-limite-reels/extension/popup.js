import { PLATFORMS, remainingMs } from "./core.js";

const form = document.querySelector("#limits");
const status = document.querySelector("#status");
const save = document.querySelector("#save");
let initialized = false;
const duration = (ms) => `${Math.floor(ms / 60000)}m ${Math.floor(ms / 1000) % 60}s`;

for (const [key, label] of Object.entries(PLATFORMS)) {
  const card = document.createElement("section");
  card.className = "platform";
  card.id = `card-${key}`;
  card.innerHTML = `<div class="row"><label for="${key}">${label}</label><input id="${key}" name="${key}" type="number" min="0" max="1440" step="1" required aria-label="${label} daily limit in minutes"></div><span class="usage" id="usage-${key}"></span><progress id="progress-${key}" max="100" value="0" aria-label="${label} daily budget used"></progress>`;
  document.querySelector("#platforms").append(card);
}

function render(state, updateInputs = false) {
  document.querySelector("#date").textContent = state.day;
  for (const key of Object.keys(PLATFORMS)) {
    if (!initialized || updateInputs) form.elements[key].value = state.limitsMinutes[key];
    const remaining = remainingMs(state, key);
    document.querySelector(`#usage-${key}`).textContent = `${duration(state.usageMs[key])} used · ${remaining ? `${duration(remaining)} left` : "Paused for today"}`;
    document.querySelector(`#progress-${key}`).value = state.limitsMinutes[key] ? Math.min(100, state.usageMs[key] / (state.limitsMinutes[key] * 600)) : 100;
    document.querySelector(`#card-${key}`).classList.toggle("exhausted", !remaining);
  }
  initialized = true;
}

async function request(message) {
  const result = await chrome.runtime.sendMessage(message);
  if (!result || result.error) throw new Error(result?.error || "Couldn't reach the extension. Reopen this popup.");
  return result;
}
function showError(error) {
  status.textContent = error.message;
  status.classList.add("error");
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  save.disabled = true;
  try {
    const limits = Object.fromEntries(Object.keys(PLATFORMS).map((key) => [key, Number(form.elements[key].value)]));
    render((await request({ type: "save", limits })).state, true);
    status.classList.remove("error");
    status.textContent = "Saved. Today's usage is kept.";
  } catch (error) { showError(error); }
  finally { save.disabled = false; }
});
async function refresh() {
  try { render((await request({ type: "snapshot" })).state); }
  catch (error) { showError(error); }
}
refresh();
setInterval(refresh, 1000);
