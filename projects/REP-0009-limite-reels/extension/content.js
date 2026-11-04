(() => {
  const labels = { reels: "Reels", shorts: "YouTube Shorts", tiktok: "TikTok" };
  let overlay;
  let blocked = false;
  let pending = false;
  let stopped = false;
  let previousFocus;

  function pauseMedia() {
    if (!blocked) return;
    document.querySelectorAll("video, audio").forEach((media) => media.pause());
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  function render(result) {
    blocked = result.blocked;
    if (!blocked) {
      if (overlay) {
        overlay.remove();
        overlay = null;
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      }
      return;
    }
    pauseMedia();
    if (!document.documentElement) return;
    if (!overlay) {
      previousFocus = document.activeElement;
      overlay = document.createElement("short-pause-limit");
      overlay.style.cssText = "all:initial!important;display:block!important;position:fixed!important;inset:0!important;z-index:2147483647!important;";
      const shadow = overlay.attachShadow({ mode: "closed" });
      shadow.innerHTML = `
        <style>
          :host { color-scheme: dark; }
          * { box-sizing: border-box; }
          .backdrop { position:fixed; inset:0; display:grid; place-items:center; padding:24px; background:#101a20; color:#f3f5ef; font:16px/1.6 system-ui,sans-serif; }
          .card { max-width:480px; text-align:center; }
          .mark { display:inline-grid; place-items:center; width:44px; height:60px; color:#c5ee94; }
          .mark::before { content:""; width:7px; height:28px; background:currentColor; box-shadow:15px 0 currentColor; transform:translateX(-7.5px); }
          .eyebrow { color:#c5ee94; font-size:12px; font-weight:700; letter-spacing:.18em; }
          h1 { font-size:36px; line-height:1.15; margin:20px 0; }
          p { color:#b6c4c8; }
          a { display:inline-block; margin-top:20px; border-radius:12px; padding:14px 24px; background:#c5ee94; color:#15211a; text-decoration:none; font-weight:700; }
          a:focus-visible { outline:3px solid white; outline-offset:5px; }
          .note { font-size:13px; margin-top:24px; }
        </style>
        <div class="backdrop" role="dialog" aria-modal="true" aria-labelledby="title" aria-describedby="detail">
          <div class="card"><div class="mark" aria-hidden="true"></div><div class="eyebrow">SHORT PAUSE</div>
          <h1 id="title">Make room for something else.</h1>
          <p id="detail"></p><a href="about:blank">Leave the feed</a>
          <p class="note">Your budget resets at local midnight.<br>Manage daily limits from the extension icon.</p></div>
        </div>`;
      overlay.detail = shadow.querySelector("#detail");
      overlay.leave = shadow.querySelector("a");
    }
    overlay.detail.textContent = `You've reached today's ${result.state.limitsMinutes[result.platform]} min limit for ${labels[result.platform]}.`;
    if (!overlay.isConnected) {
      document.documentElement.append(overlay);
      overlay.leave.focus({ preventScroll: true });
    }
  }

  async function pulse() {
    if (pending || stopped) return;
    pending = true;
    const url = location.href;
    try {
      const result = await chrome.runtime.sendMessage({ type: "pulse", visible: !document.hidden, focused: document.hasFocus() });
      if (result?.error) throw new Error(result.error);
      if (result && url === location.href) render(result);
    } catch (error) {
      if (!chrome.runtime?.id || /context invalidated/i.test(error.message)) {
        stopped = true;
        clearInterval(timer);
        // A reloaded extension needs a page reload to attach its new scripts.
      }
    } finally { pending = false; }
  }

  document.addEventListener("play", pauseMedia, true);
  document.addEventListener("keydown", (event) => {
    if (!blocked) return;
    event.stopImmediatePropagation();
    if (event.key !== "Enter") event.preventDefault();
    overlay?.leave.focus({ preventScroll: true });
  }, true);
  for (const event of ["visibilitychange", "focus", "blur", "popstate", "pageshow", "yt-navigate-finish"]) {
    window.addEventListener(event, pulse, true);
  }
  // Polling catches pushState/replaceState in all supported SPAs without
  // injecting code into the page world or relying on private site selectors.
  const timer = setInterval(pulse, 1000);
  pulse();
})();
