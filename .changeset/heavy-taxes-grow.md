---
"@rnbo-runner-panel/client": patch
---

Fix package datafile duplicate in subdirectory detection

Before this a datafile that wasn't at the top level of the datafiles directory would always be installed even if it was already on disk.
