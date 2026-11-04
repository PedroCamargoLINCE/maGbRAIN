# Android support — 0.2.0 candidate

**Short Pause is not yet verified on a physical Android device.** This release removes the known Edge Android API incompatibility and adds mobile layouts plus a real CRX3 package. It does not add extension support to Android Chrome or control native social apps.

| Target | Current status | Installation |
| --- | --- | --- |
| Chrome desktop | Automated browser tests pass | Load unpacked or build ZIP, as in README |
| Edge desktop | Automated browser tests pass | Same ZIP/files |
| Edge Android | Compatibility candidate; API tests and mobile emulation, no device test | CRX developer sideload where the installed channel exposes it |
| Chrome Android | Cannot run this extension | A separate Android implementation would be required |
| Instagram/YouTube/TikTok native apps | Not covered | Not browser pages; outside this extension's scope |

## Why Android is different

Google's [extension installation guide](https://support.google.com/chrome/answer/2664769?hl=en) describes desktop support; its phone flow installs an extension **on your computer**, not on the phone. Desktop-site mode does not supply an extension runtime.

Microsoft's [supported APIs table](https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/api-support) lists Android support for `runtime`, `tabs`, `storage` and `action`, but not `windows`. Version 0.1.0 accessed `windows` unconditionally. Version 0.2.0 uses the active tab plus document visibility/focus on Android, retains window-focus checks on desktop, and drops stale samples after app suspension.

## Try the Edge Android candidate

This is a developer test path, not a store listing or a guarantee that every Edge channel can install arbitrary extensions. Microsoft's own [experimental Android runbook](https://github.com/microsoft/amplifier-browser-bridge/blob/main/docs/ANDROID.md) records the Canary/Beta CRX flow and notes that availability varies. Its networking and battery instructions are specific to that other project and are not required by Short Pause.

1. Obtain `short-pause-0.2.0-edge-android.crx` from the CI artifact or build it below. Extract the artifact ZIP on the phone first. A ZIP renamed to CRX will not work.
2. In **Edge Canary for Android**, open **Settings → About Microsoft Edge** and tap the build/version number five times. Return to Settings and look for **Developer options → Extension install by crx**. Labels/availability may vary by release. If absent, this channel does not expose the required installation flow; do not assume desktop's `edge://extensions` instructions apply.
3. Select the CRX, inspect its site/storage permissions, and accept the browser's installation prompt. Confirm Short Pause is listed and enabled in Edge's Extensions menu.
4. Open Short Pause from that menu, save your budgets, then reload existing supported tabs. Start with **0 minutes** to check blocking before trusting the timer.
5. If a direct CRX download disappears, transfer it inside a ZIP and extract it using the phone's Files app. Do not rename the extension ZIP to CRX.

Short Pause has no server and needs no account, VPN, device-administrator, accessibility or Android overlay permission. **Do not also count the desktop extension's budget as this phone's budget**: profiles/devices remain independent.

## Build a real CRX3

With Python 3, OpenSSL and an installed Chrome/Edge/Chromium executable:

```sh
python3 scripts/package_crx.py \
  --browser /path/to/chrome \
  --key-file /private/path/outside-the-repository/short-pause.pem
```

The script creates a private signing key if missing, uses Chromium's packer, checks the CRX3 header and embedded manifest, and emits `dist/short-pause-0.2.0-edge-android.crx`. The key is never included in the package. Keep it private and reuse it for updates so the extension keeps its identity.

**CI uses a temporary development key.** Its CRX identity changes between runs. Treat CI packages as disposable test builds; installing a new identity gives a separate budget and settings. A stable release requires a maintainer-controlled signing key and an agreed distribution path. No store publication has been performed.

## Verification and device acceptance

Run `npm test` for the worker test with no `windows` API. This uses a simulated Android API surface. To exercise the actual extension with touch/narrow layouts in a desktop browser:

```sh
MOBILE=1 BROWSER_PATH=/path/to/microsoft-edge BROWSER_LABEL=edge-mobile-emulation npm run test:browser
```

This verifies the popup at 320px, touch targets, portrait/landscape blocker controls, touch navigation out of the feed, persistence and counting. **Mobile emulation is not an Android operating system or Edge Android runtime test.**

Before declaring Android supported, record a device model, Android version and Edge channel/version, then verify:

- CRX installs, menu opens, settings save, and all three categories block with limit 0.
- At limit 1, foreground scrolling eventually blocks; normal YouTube videos and Instagram messages remain usable.
- Switching tabs, pressing Home, locking the screen and leaving Edge for two minutes do not add those two minutes to usage.
- Returning to Edge resumes counting; screen rotation leaves the exit control usable; tapping it leaves the feed.
- Force-close/reopen preserves usage/settings; local midnight renews the daily budget.

The requested coverage of **Chrome on Android** remains blocked by its missing extension runtime. If that is required, choose the scope of a separate Android companion app (browser feeds, native apps, or both) and its user-granted permissions before claiming equivalent coverage. No such app is delivered in this branch.
