---
"@rnbo-runner-panel/server": patch
---

Serve the panel on a dual-stack socket (`[::]:3000`) so it is reachable over IPv6 as well as IPv4.
This makes the interface browsable over a direct ethernet connection, where mDNS resolves the host to a link-local IPv6 address, e.g. `http://c74rpi.local:3000`. Falls back to the IPv4 wildcard if IPv6 is unavailable.
