# @rnbo-runner-panel/server

## 2.2.0

### Minor Changes

- 04d0bd7: #250 Migrate to a rust based server backend
- 923436b: Add changeset automation to create releases and remove private, publishing workflows in favor of distinct changelogs for both, the server as well as the client part of the rnbo-runner-panel.

### Patch Changes

- 7073318: #279 Add defaults for runner directores, fixing bug for package creation when package dir doesn't exist
- 3098668: #275 Bugfix: Added tar content header for rnbopack files
- 760e85a: #296 Skip npm publishing in Release workflow as there is nothing to publish.
- 6fcde57: #296 Fixed Release workflow to use correct git sha for release
- de6e58e: #296 Fix Release version tagging in release workflow
- a54d5ea: Migrate to a cargo workspace for rust project
- 39956a0: #266 Ensure that the server's Cargo version gets bumped alongside any general version bump to @rnbo-runner-panel/server

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

## 2.2.0-beta.16

### Patch Changes

- 7073318: Add defaults for runner directores, fixing bug for package creation when package dir doesn't exist

## 2.2.0-beta.15

### Patch Changes

- 3098668: Bugfix: Added tar content header for rnbopack files

## 2.2.0-beta.14

### Patch Changes

- a54d5ea: Migrate to a cargo workspace for rust project
- 39956a0: #266 Ensure that the server's Cargo version gets bumped alongside any general version bump to @rnbo-runner-panel/server

## 2.2.0-beta.13

### Minor Changes

- 04d0bd7: Migrate to a rust based server backend
- 923436b: Add changeset automation to create releases and remove private, publishing workflows in favor of distinct changelogs for both, the server as well as the client part of the rnbo-runner-panel.
