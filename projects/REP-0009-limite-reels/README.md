# Short Pause — Reels, Shorts & TikTok limits

A Manifest V3 extension for **desktop Chrome and Microsoft Edge**, with no backend or runtime dependencies. Set a daily budget for Reels, YouTube Shorts and TikTok. When it runs out, the extension pauses media and covers the feed with a reminder to leave.

Related idea: [REP-0009](../../ideas/REP-0009-limite-reels/IDEA.md) · [Issue #14](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/14) · [Project status](STATUS.md)

## Install in Chrome or Edge

1. Download this branch/repository and unzip it, or build the ZIP below and extract it. Keep the extracted folder in a permanent location.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**. Select **Load unpacked**.
4. Select `projects/REP-0009-limite-reels/extension` (the folder containing `manifest.json`). For the packaged ZIP, select its extracted folder instead.
5. Pin **Short Pause** from the extensions menu. **Reload any already-open supported websites** so the content script attaches.
6. Click the extension icon, choose whole minutes for each category, and select **Save daily limits**. Defaults are **15 minutes per category per day**. Set a category to **0** to block it immediately.

The same files run in both browsers; no Node/Python installation is needed to load `extension/`. This is an unpacked prototype, not a Chrome Web Store or Edge Add-ons listing. Managed browsers may prohibit developer extensions. Chrome/Edge 120+ APIs are required; tested versions are recorded in the handoff.

## What counts

| Category | Supported pages | Budget |
| --- | --- | --- |
| Reels | Instagram and Facebook `/reel/…`, `/reels/…`, and `/reels` | Shared across both sites |
| YouTube Shorts | YouTube `/shorts` and `/shorts/…` | Separate from Reels |
| TikTok | All pages on TikTok, including its home feed and individual videos | Entire site |

HTTPS subdomains, including `www` and `m`, are supported. Normal YouTube watch pages, Instagram messages and Facebook home pages are unaffected. **Reels embedded in ordinary home feeds, Instagram posts using `/p/…`, embedded players on other websites, native mobile apps and alternative frontends are outside this prototype's scope.**

- Time counts when a supported feed is the active tab in the focused browser window and its document has focus. This is **time on the feed**, including reading comments or paused videos; it does not measure video playback duration or number of swipes.
- Background tabs and unfocused browser windows do not count. Multiple tabs share one budget. Counting/blocking updates roughly every second; a short overshoot is possible. Sampling gaps longer than two seconds are discarded so sleep/suspension does not become usage.
- Usage and limits survive browser restarts. Budgets reset at **local midnight**, checked on the next interaction/heartbeat. Changing a limit keeps today's usage; raising a limit can restore access immediately.
- Chrome and Edge profiles keep **independent budgets**. Nothing syncs across profiles or devices.
- This is a voluntary focus aid. Changing limits, disabling/removing the extension, clearing extension storage, changing the system clock, or using another profile can bypass it. Incognito/InPrivate is not enabled by default.
- After updating/reloading the extension, reload supported website tabs. A tab holding an old content script cannot reconnect to a reloaded extension automatically.

## Build and verify

From this directory, with Node 20+ and Python 3:

```sh
npm ci
npm test
npm run build
```

Outputs (ignored by Git):

- `dist/short-pause/` — ready to load unpacked.
- `dist/short-pause-0.1.0-chrome-edge.zip` — extract before loading; also usable as the starting archive for future store submission.

Run the integration suite with a local Chrome or Edge executable supporting the DevTools `Extensions.loadUnpacked` command (137+):

```sh
BROWSER_PATH=/path/to/google-chrome BROWSER_LABEL=chrome npm run test:browser
BROWSER_PATH=/path/to/microsoft-edge BROWSER_LABEL=edge npm run test:browser
```

For an isolated Chromium test installation:

```sh
npx playwright install --with-deps chromium
BROWSER_PATH="$(node --input-type=module -e 'import { chromium } from "playwright"; console.log(chromium.executablePath())')" BROWSER_LABEL=chromium npm run test:browser
```

The integration suite loads the actual extension into a temporary profile. It substitutes controlled HTML/video fixtures at the supported HTTPS URLs, exercising real extension APIs, tab focus, playback, route changes, popup settings and browser restart. It does **not** log into production services or certify their current DOM. Screenshots are written to `test-results/`. CI runs these checks with Chromium and produces an installable ZIP artifact.

For a final live-site check, set each limit to 0 and open its supported feed; confirm the blocker and paused playback. Increase to 1, spend a minute there, then switch tabs and navigate back to a normal page. Confirm a browser restart preserves the usage. Logged-in live-site and daily personal-use validation remain a follow-up.

## Privacy and permissions

See [PRIVACY.md](PRIVACY.md). The only general permission is `storage`. Access to the four supported website families is needed to inject the blocker, pause media and identify active routes, including navigation without a page reload. No `tabs`, `history`, account, payment or analytics permission is requested. No URLs or video titles are stored. All code is bundled locally.

Implementation: `extension/core.js` handles routes/budgets, `background.js` serializes accounting across tabs, `content.js` applies the blocker, and `popup.*` edits limits. `storage.local` holds today's counters/settings; `storage.session` holds a short-lived accounting sample across service-worker restarts.
