---
"@rnbo-runner-panel/client": patch
---

Notice when the connection to the runner has died, instead of showing a working UI that is talking to nothing.
An idle WebSocket whose network path disappears (a cable pulled, a runner powered off) stays open and fires no close event, so the panel had no way to find out until TCP eventually gave up minutes later. It now probes a small OSCQuery node when the connection has been idle for 10s and treats a 5s silence as a disconnect, which surfaces the reconnecting state and starts the reconnect.
