# Virtuoso launcher (`virtuoso_launcher.tcl`)

Small **Tcl/Tk** (`wish`) GUI to set **reference base library** and **Cadence** environment variables, optionally `source` your site setup script, then start **Cadence Virtuoso** in a background shell.

## Prerequisites (workstation)

| Requirement | Notes |
|-------------|--------|
| **OS** | **Linux** (or UNIX where Virtuoso runs). The launcher shells out to **bash**; it is not aimed at native Windows Virtuoso installs. |
| **Tcl/Tk** | The `wish` interpreter (often package names `tcl`, `tk`, or `tcl-tk`). |
| **bash** | Used to run the generated launch script. |
| **Cadence** | Valid **CDSROOT**, your usual **environment setup** (e.g. `cdsenv.sh`), and a working **`virtuoso`** (or site-specific command). |

### Check Tcl/Tk

```bash
which wish
wish -c 'puts $tcl_version; exit'
```

If `wish` is missing, install Tcl/Tk from your OS (examples):

- **RHEL / Rocky / Alma**: `sudo dnf install tcl tk`
- **Ubuntu / Debian**: `sudo apt install tk`

## Get the script

From a clone of this repo:

```bash
git clone https://github.com/egg4lab/gitgiggle.git
cd gitgiggle/tools/virtuoso
```

Or copy only `virtuoso_launcher.tcl` to a directory on your workstation.

## Run once

```bash
chmod +x virtuoso_launcher.tcl
./virtuoso_launcher.tcl
```

Or, without execute bit:

```bash
wish virtuoso_launcher.tcl
```

## What to fill in

| Field | Purpose |
|--------|--------|
| **REF_BASE_LIB** | Directory your flow treats as the **reference base library** (exported as `REF_BASE_LIB`). Point this at your PDK/reference library root or leave empty if you do not use it. |
| **CDSROOT** | Cadence installation root (exported as `CDSROOT`). Must be an existing directory. |
| **Setup script** | Optional path to a **bash-readable** file to **`source`** before Virtuoso (e.g. vendor `cdsenv.sh` or your own script that sets `PATH` and Cadence variables). Leave empty to skip. |
| **Virtuoso command** | Command run at the end, after exports and optional `source`. Examples: `virtuoso`, `virtuoso -64`, or a full path if it is not on `PATH` yet. |

The launcher prepends `$CDSROOT/tools/bin` and `$CDSROOT/tools/dfII/bin` to `PATH` when those directories exist.

## Save settings

Click **Save settings**. This writes:

`~/.config/gitgiggle/virtuoso_launcher.rc`

The file is Tcl; you can edit it by hand or delete it to reset. The GUI loads it automatically on the next start.

## Typical workflow

1. Enter real **CDSROOT** and **REF_BASE_LIB** (if used).
2. Set **Setup script** to the same file you normally `source` before Virtuoso in a terminal.
3. Set **Virtuoso command** to what you normally type to start the tool.
4. Click **Save settings** (optional but convenient).
5. Click **Launch Virtuoso**. The GUI stays open; Virtuoso runs in a separate process.

## Optional: shell alias or menu entry

```bash
alias vv='wish /path/to/gitgiggle/tools/virtuoso/virtuoso_launcher.tcl'
```

For a desktop shortcut, use your desktop environment’s “custom command” launcher with the same `wish` line (full path recommended).

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `wish: command not found` | Install Tcl/Tk (see above); ensure `/usr/bin` or your Tcl `bin` is on `PATH`. |
| Launch fails immediately | Confirm **CDSROOT** exists; if **Setup script** is set, it must be **readable**; **REF_BASE_LIB** must be empty or a valid directory. |
| Virtuoso not found | Point **Setup script** at the correct `cdsenv` / site script, or set **Virtuoso command** to the **full path** of the binary. |
| Wrong environment vs. manual terminal | Compare what you `source` interactively with the **Setup script** path; they should match. |

## Files in this folder

| File | Role |
|------|------|
| `virtuoso_launcher.tcl` | The `wish` GUI and launch logic. |
| `README.md` | This guide. |
