# Known Issues & Root Cause Logs

This document tracks significant bugs, their root causes, and how they were resolved to prevent regressions.

## 1. Standalone Binary Execution (pkg) Failed on Clean Machine
- **Symptom**: `larp run file.larp` failed on standard machines, or directly executing `larp-lang-win.exe run file.larp` failed with `MODULE_NOT_FOUND`.
- **Root Cause**:
  1. The transpiler in `src/cli/index.ts` was using `.replace()` instead of `.replaceAll()` when substituting `require` paths. This meant if a user imported multiple standard libraries (or the same library was required twice), only the first import was correctly updated to point to the `pkg` virtual filesystem.
  2. The code wrote the generated script to `%TEMP%` and executed it via `child_process.execFileSync(process.execPath)`. Spawning new processes from within `pkg` requires the new process to accurately inherit the virtual filesystem. When executed from unexpected directories or when the temp JS file is flagged by Windows Antivirus, it fails entirely.
- **Fix**: Replaced `.replace` with `.split().join()` (a universal `replaceAll` equivalent) and migrated the code execution to run synchronously within the *same* process using Node's `Module._compile(patchedJs, absPath)`. This completely skips the temp file writes and eliminates the need for child processes.

## 2. Windows PATH Setup
- **Symptom**: `install.ps1` would successfully update the registry `Path` for the user, but `larp` wouldn't be immediately recognized if the user tried to use it in an already-open terminal.
- **Root Cause**: Windows environment variable changes via registry (`[Environment]::SetEnvironmentVariable`) broadcast a `WM_SETTINGCHANGE` message, which Explorer picks up. Newly spawned terminal tabs will pick this up automatically, but currently-running PowerShell processes will not.
- **Fix**: Added explicit, plain-English messaging directly in the installer output emphasizing that the user **must** open a completely new terminal for the `larp` command to work.
