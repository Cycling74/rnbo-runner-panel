# @rnbo-runner-panel/client

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
