---
"@rnbo-runner-panel/server": patch
---

Stage file uploads in an XDG cache directory (`~/.cache/rnbo-runner-panel/tmp`) instead of `/tmp`.
Fixes upload failures on devices with a small (tmpfs) `/tmp`, e.g. Raspberry Pi 2 W. Overridable via `temp_dir` in the runner config JSON.
