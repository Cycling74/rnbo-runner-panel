---
"@rnbo-runner-panel/client": patch
---

Keep retrying the runner connection instead of giving up after ten quick attempts.
Reconnects now use exponential backoff (500ms up to 30s) and are unbounded once a connection has been established, so an outage that outlasts the old ~5s budget no longer leaves the UI dead until a manual reload. A pending backoff is cut short when the browser comes back online or the tab becomes visible again. The initial connect keeps a bounded retry count, so an unreachable endpoint still reports an error.
