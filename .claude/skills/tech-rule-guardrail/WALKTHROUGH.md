# Try It Yourself — Step-by-Step Walkthrough

A hands-on walkthrough using the demo files already in this repo
(`Input_Data/`, `config/baseline_gpdk045.yaml`). For the general reference
docs, see `README.md`; for the Claude Code skill definition, see
`SKILL.md`.

Prerequisites (confirmed installed on this machine already): KLayout
(`klayout -b` on `PATH`), Python 3 + PyYAML, Claude Code CLI.

Run everything from the repo root:
```powershell
cd "C:\Users\psho\OneDrive - Winbond Electronics Corporation\D\OneDrive - Winbond Electronics Corporation\D\TOOL\GHEC\GitGiggle"
$env:PATH += ";C:\Users\psho\AppData\Roaming\KLayout"
```

## Step 1 — Build a baseline

A baseline (`baseline.yaml`) lists which layer/datatype pairs are
`allowed`, `deprecated`, or `reserved` for a node. Normally you'd copy
`config/baseline.example.yaml` and fill in real numbers from your node's
layer map — but this repo already has one built and ready:
`config/baseline_gpdk045.yaml`. Nothing to do here to just try it out.

## Step 2 — Run the whole pipeline in one shot

```powershell
.claude\skills\tech-rule-guardrail\scripts\run_pipeline.ps1 `
  -Gds "Input_Data\DiffOpAmp.gds" `
  -Baseline ".claude\skills\tech-rule-guardrail\config\baseline_gpdk045.yaml" `
  -OutDir ".\my_check_out"
```

This runs all 3 stages back to back and writes `my_check_out\usage.json`,
`violations.json`, `report.md`. Should come back with 0 violations, since
`DiffOpAmp.gds` is clean against this baseline.

## Step 3 — Or run each stage manually (to see what each one does)

```powershell
# 3a. Extract layer usage from the GDS via KLayout batch mode
klayout -b -r ".claude\skills\tech-rule-guardrail\scripts\dump_layers.rb" -rd gds="Input_Data\DiffOpAmp.gds" -rd out="usage.json"

# 3b. Compare against the baseline
python ".claude\skills\tech-rule-guardrail\scripts\check_violations.py" --usage usage.json --baseline ".claude\skills\tech-rule-guardrail\config\baseline_gpdk045.yaml" --out violations.json

# 3c. Generate the plain-language report
.claude\skills\tech-rule-guardrail\scripts\generate_report.ps1 -Violations violations.json -Schema ".claude\skills\tech-rule-guardrail\docs\violations.schema.md" -OutFile report.md
```

**Note:** step 3a needs the `klayout.exe` GUI-subsystem quirk worked
around — the one-shot `run_pipeline.ps1` in step 2 already handles this
for you via `Start-Process -Wait`. If you run `klayout` bare like above
and it seems to return instantly with no `usage.json` created, that's why
(PowerShell doesn't block on GUI-subsystem binaries by default).

## Step 4 — See a real violation caught

Point it at the "bad" demo file instead:
```powershell
.claude\skills\tech-rule-guardrail\scripts\run_pipeline.ps1 `
  -Gds "Input_Data\guardrail_out_bad\DiffOpAmp_demo.gds" `
  -Baseline ".claude\skills\tech-rule-guardrail\config\baseline_gpdk045.yaml" `
  -OutDir ".\my_bad_check"
```
Check `my_bad_check\violations.json` — should show 1 violation on layer
69/0 (`reserved`, standing in for this node's not-yet-known real
OPC-reserved layer — see the comment in `baseline_gpdk045.yaml`).

Print just the violation summary:
```powershell
(Get-Content my_bad_check\violations.json | ConvertFrom-Json).violations |
  Select-Object cell, layer, dt, category, shape_count | Format-Table -AutoSize
```

## Step 5 — Waive an intentional violation (if you ever have one)

Copy `config/waivers.example.yaml`, add an entry like:
```yaml
waivers:
  - cell: TESTCELL_A
    layer: 63
    dt: 0
    reason: "Intentional legacy cap for characterization test structure"
    owner: "jdoe"
```
Pass `-Waivers waivers.yaml` to `run_pipeline.ps1` (or `--waivers` to
`check_violations.py`) — the waived triple drops out of `violations.json`
and counts separately under `waived_count`.

## Using this on a real block

Once you have a real GDS and a real, design-team-confirmed baseline
(rather than the GPDK045 demo baseline), the exact same commands apply —
just swap `-Gds`, `-Baseline`, and (optionally) `-Waivers` to point at the
real files.
