# Try It Yourself — Step-by-Step Walkthrough (Git Bash)

A hands-on walkthrough using the demo files already in this repo
(`Input_Data/`, `config/baseline_gpdk045.yaml`), for **Git Bash**. For the
general reference docs, see `README.md`; for the Claude Code skill
definition, see `SKILL.md`.

Prerequisites (confirmed installed on this machine already): KLayout,
Python 3, PyYAML, Claude Code CLI.

Open **Git Bash** (not PowerShell/cmd) and run:
```bash
cd "/c/Users/psho/OneDrive - Winbond Electronics Corporation/D/OneDrive - Winbond Electronics Corporation/D/TOOL/GHEC/GitGiggle"
```

> **Note on `klayout`:** it's already on your permanent (User-level) PATH,
> so a freshly opened Git Bash window should find it automatically. If you
> get `klayout: command not found`, either close and reopen Git Bash, or
> just run this once per session as a safety net:
> ```bash
> export PATH="$PATH:/c/Users/psho/AppData/Roaming/KLayout"
> ```
>
> **Note on `python`:** on this machine the command is `python`, not
> `python3` (the Windows Python.org installer doesn't register a `python3`
> shim). `run_pipeline.sh` already detects this automatically, so you
> don't need to do anything for the one-shot pipeline. If you run
> `check_violations.py` manually (step 3b below), use `python`, not
> `python3`.

## Step 1 — Build a baseline

A baseline (`baseline.yaml`) lists which layer/datatype pairs are
`allowed`, `deprecated`, or `reserved` for a node. Normally you'd copy
`config/baseline.example.yaml` and fill in real numbers from your node's
layer map — but this repo already has one built and ready:
`config/baseline_gpdk045.yaml`. Nothing to do here to just try it out.

## Step 2 — Run the whole pipeline in one shot

```bash
.claude/skills/tech-rule-guardrail/scripts/run_pipeline.sh \
  Input_Data/DiffOpAmp.gds \
  .claude/skills/tech-rule-guardrail/config/baseline_gpdk045.yaml \
  "" \
  ./my_check_out
```

(The third argument, `""`, is an empty placeholder for the optional
waivers file — leave it as `""` if you don't have one yet.)

This runs all 3 stages back to back and writes `my_check_out/usage.json`,
`violations.json`, `report.md`. Should come back with `0 violation(s)`,
since `DiffOpAmp.gds` is clean against this baseline — confirmed by
actually running this exact command just now.

## Step 3 — Or run each stage manually (to see what each one does)

```bash
# 3a. Extract layer usage from the GDS via KLayout batch mode
klayout -b -r .claude/skills/tech-rule-guardrail/scripts/dump_layers.rb \
  -rd gds=Input_Data/DiffOpAmp.gds -rd out=usage.json

# 3b. Compare against the baseline (use "python", not "python3", on this machine)
python .claude/skills/tech-rule-guardrail/scripts/check_violations.py \
  --usage usage.json \
  --baseline .claude/skills/tech-rule-guardrail/config/baseline_gpdk045.yaml \
  --out violations.json

# 3c. Generate the plain-language report
.claude/skills/tech-rule-guardrail/scripts/generate_report.sh \
  violations.json \
  .claude/skills/tech-rule-guardrail/docs/violations.schema.md \
  report.md
```

## Step 4 — See a real violation caught

Point it at the "bad" demo file instead:
```bash
.claude/skills/tech-rule-guardrail/scripts/run_pipeline.sh \
  Input_Data/guardrail_out_bad/DiffOpAmp_demo.gds \
  .claude/skills/tech-rule-guardrail/config/baseline_gpdk045.yaml \
  "" \
  ./my_bad_check
```
Check `my_bad_check/violations.json` — should show 1 violation on layer
69/0 (`reserved`, standing in for this node's not-yet-known real
OPC-reserved layer — see the comment in `baseline_gpdk045.yaml`).

Print just the violation summary (needs `python`, works the same in Git
Bash as anywhere else):
```bash
python -c "import json; d=json.load(open('my_bad_check/violations.json')); [print(v['cell'], v['layer'], v['dt'], v['category'], v['shape_count']) for v in d['violations']]"
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
Pass the waivers file as the 3rd argument to `run_pipeline.sh` (in place
of the `""` above), or `--waivers` to `check_violations.py` directly — the
waived triple drops out of `violations.json` and counts separately under
`waived_count`.

## Using this on a real block

Once you have a real GDS and a real, design-team-confirmed baseline
(rather than the GPDK045 demo baseline), the exact same commands apply —
just swap the GDS path, baseline path, and (optionally) waivers path to
point at the real files.
