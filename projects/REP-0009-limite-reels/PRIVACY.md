# Privacy — Short Pause 0.1.0

Short Pause does not collect or transmit personal data. It has no server, telemetry, ads, tracking pixels, remote scripts or account system.

The extension reads a supported tab's URL in memory to recognize Reels, Shorts or TikTok. It checks tab/window focus and page visibility, and pauses audio/video elements after a limit is exhausted. It does not read messages, credentials, cookies, video titles, page text or browsing history.

`chrome.storage.local` stores only the current local date, per-category daily usage in milliseconds, and three minute limits. `chrome.storage.session` temporarily stores the sampled tab ID, category and timestamps. It does not store URLs or a history of previous days. This data stays within the browser profile; Chrome and Edge do not share it through this extension.

Uninstalling the extension removes its stored data. Chrome/Edge themselves and the websites have their own privacy policies. This prototype adds no third-party data recipients.
