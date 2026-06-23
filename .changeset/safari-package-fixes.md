---
"@rnbo-runner-panel/client": patch
"@rnbo-runner-panel/server": patch
---

Fix package download and upload in Safari.

- Download: the server now sends a `Content-Disposition: attachment; filename="*.rnbopack"` header for package files, so Safari saves them with the correct `.rnbopack` extension instead of `.tar`.
- Upload: replaced the per-request OSCQuery message listener with a single shared message router. This eliminates the `MaxListenersExceededWarning` raised while installing packages that add many paths at once, and ensures a missing reply surfaces as a timeout error instead of hanging the install silently.

re #346
