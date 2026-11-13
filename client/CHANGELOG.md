# @rnbo-runner-panel/client

## 2.5.0-beta.1

## 2.5.0-beta.0

### Minor Changes

- [#360](https://github.com/Cycling74/rnbo-runner-panel/pull/360) [`d1bfa71`](https://github.com/Cycling74/rnbo-runner-panel/commit/d1bfa71cc8b4892bdf147aa50ca67e8d1a056535) - Added support for [Link Audio](https://www.ableton.com/en/link/) via [Jack Tranport Link](https://github.com/x37v/jack_transport_link).

### Patch Changes

- [#362](https://github.com/Cycling74/rnbo-runner-panel/pull/362) [`21583d6`](https://github.com/Cycling74/rnbo-runner-panel/commit/21583d6ae5f6ce438fd1bdd100b38e537df7b3cf) - Updated the transport control UI

  - Added a simple transport location indication and rewind
  - Added link sync toggle
  - Added time signature UI

- [#362](https://github.com/Cycling74/rnbo-runner-panel/pull/362) [`21583d6`](https://github.com/Cycling74/rnbo-runner-panel/commit/21583d6ae5f6ce438fd1bdd100b38e537df7b3cf) - Added support for toggling transport sync to link on/off

- [#365](https://github.com/Cycling74/rnbo-runner-panel/pull/365) [`78dc2b9`](https://github.com/Cycling74/rnbo-runner-panel/commit/78dc2b97a6e0ed9d04b205d8e8bff175b3f937af) - Fix package datafile duplicate in subdirectory detection

  Before this a datafile that wasn't at the top level of the datafiles directory would always be installed even if it was already on disk.

- [#364](https://github.com/Cycling74/rnbo-runner-panel/pull/364) [`13f18a2`](https://github.com/Cycling74/rnbo-runner-panel/commit/13f18a2c64b3923ee39ab88d38ba4a55bc266130) - Added optional "Load after Install" and "Load on Startup" to the Package Install dialog when there is only 1 graph in a package.

- [#360](https://github.com/Cycling74/rnbo-runner-panel/pull/360) [`6ba8a4a`](https://github.com/Cycling74/rnbo-runner-panel/commit/6ba8a4a541452c59c8671cc5100099222fb6a8d2) - Using Jack's order metadata to sort ports for a client, if present

- [#363](https://github.com/Cycling74/rnbo-runner-panel/pull/363) [`895404c`](https://github.com/Cycling74/rnbo-runner-panel/commit/895404c12984f7ee4e5e6fe8b0df09f582a32747) - Keep retrying the runner connection instead of giving up after ten quick attempts.
  Reconnects now use exponential backoff (500ms up to 30s) and are unbounded once a connection has been established, so an outage that outlasts the old ~5s budget no longer leaves the UI dead until a manual reload. A pending backoff is cut short when the browser comes back online or the tab becomes visible again. The initial connect keeps a bounded retry count, so an unreachable endpoint still reports an error.

- [#363](https://github.com/Cycling74/rnbo-runner-panel/pull/363) [`47f20d6`](https://github.com/Cycling74/rnbo-runner-panel/commit/47f20d684e82d6053f113b4d4b9a967a16e86793) - Notice when the connection to the runner has died, instead of showing a working UI that is talking to nothing.
  An idle WebSocket whose network path disappears (a cable pulled, a runner powered off) stays open and fires no close event, so the panel had no way to find out until TCP eventually gave up minutes later. It now probes a small OSCQuery node when the connection has been idle for 10s and treats a 5s silence as a disconnect, which surfaces the reconnecting state and starts the reconnect.

## 2.4.1

### Patch Changes

- 402eae4: Fix MIDI indicator dot overflowing horizontally outside the parameter box. Thanks @fcana

## 2.4.0

### Minor Changes

- ae4652f: Implement datafile subdirectory navigation, uploading, deleting, mapping. re #320

### Patch Changes

- 7139bbd: Fix package download and upload in Safari.

  - Download: the server now sends a `Content-Disposition: attachment; filename="*.rnbopack"` header for package files, so Safari saves them with the correct `.rnbopack` extension instead of `.tar`.
  - Upload: replaced the per-request OSCQuery message listener with a single shared message router. This eliminates the `MaxListenersExceededWarning` raised while installing packages that add many paths at once, and ensures a missing reply surfaces as a timeout error instead of hanging the install silently.

  re #346

- 02bb3a4: Fix bug where parameter values weren't updating in real-time when the parameter name contained spaces.

  re #350

## 2.3.3

### Patch Changes

- 72b24e9: Fix bug where parameter display order wasn't being used for sorting when it said it was.

  re #341

- 71d0c00: Show current parameter value inline in the parameter label. Reduced font size of slider mark labels for better visual balance.

## 2.3.2

### Patch Changes

- 2dfb7df: Update patcher UUIDs when they change, fixing package upload collision messaging
- f681d00: Add changelog links to release workflow

## 2.3.1

### Patch Changes

- 051724d: Match package item UUIDs and detect/display install, skip, overwrite status on upload

## 2.3.0

### Minor Changes

- 0b2eba0: Add support for new rnbo compatibility version while installing package content

## 2.2.1

### Patch Changes

- 3c9cf63: #311 Update debian packaging script to coordinate our semver version with debian's notion of version ordering

## 2.2.0

### Minor Changes

- 04d0bd7: #250 Migrate to a rust based server backend

### Patch Changes

- 2e855f9: #274 Updated package info display to look less like text entry
  Added runner RNBO version to error with package version mismatches
- 760e85a: #296 Skip npm publishing in Release workflow as there is nothing to publish.
- 6fcde57: #296 Fixed Release workflow to use correct git sha for release
- 923436b: Add changeset automation to create releases and remove private, publishing workflows in favor of distinct changelogs for both, the server as well as the client part of the rnbo-runner-panel.
- de6e58e: #296 Fix Release version tagging in release workflow
- 2e855f9: #273 Renamed "Audio File" to "Data File" and removed file/mime type restriction for upload
  Also increased file count limit for upload
- f051137: Consolidated upload triggers in single Upload button on Resources page
- 238d375: #266 Fix version display in About Screen
- 7caa95b: #225 Implement MIDI mapping for Inports
- 2e855f9: Updated package drag area to look like you can drop .rnbopack
- c65876f: #225 Enhanced MIDI Mapping view to support displaying mappings for Message Inports as well as Parameters.

## 2.2.0-beta.20

### Patch Changes

- 6fcde57: #296 Fixed Release workflow to use correct git sha for release

## 2.2.0-beta.19

### Patch Changes

- 760e85a: #296 Skip npm publishing in Release workflow as there is nothing to publish.

## 2.2.0-beta.18

### Patch Changes

- de6e58e: #296 Fix Release version tagging in release workflow

## 2.2.0-beta.17

### Patch Changes

- 2e855f9: Updated package info display to look less like text entry
  Added runner RNBO version to error with package version mismatches
- 2e855f9: Renamed "Audio File" to "Data File" and removed file/mime type restriction for upload
  Also increased file count limit for upload
- f051137: Consolidated upload triggers in single Upload button on Resources page
- 7caa95b: Implement MIDI mapping for Inports
- 2e855f9: Updated package drag area to look like you can drop .rnbopack
- c65876f: #225 Enhanced MIDI Mapping view to support displaying mappings for Message Inports as well as Parameters.

## 2.2.0-beta.16

## 2.2.0-beta.15

## 2.2.0-beta.14

### Patch Changes

- 238d375: #266 Fix version display in About Screen

## 2.2.0-beta.13

### Minor Changes

- 04d0bd7: Migrate to a rust based server backend

### Patch Changes

- 923436b: Add changeset automation to create releases and remove private, publishing workflows in favor of distinct changelogs for both, the server as well as the client part of the rnbo-runner-panel.
