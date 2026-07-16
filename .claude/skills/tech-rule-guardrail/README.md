# Technology Rule Guardrail

Early, AI-assisted verification of GDS/OASIS layer usage against a
versioned technology-layer legality baseline — catching illegal,
deprecated, or reserved layer usage before signoff or data handoff, in
minutes, without modifying any editor or signoff environment.

This is the utility implementation of **Proposal A** (see the sibling
proposal document for the full business write-up). It is also registered
as a Claude Code skill (`SKILL.md`) so an assistant can drive the pipeline
on request.

## Why

During physical implementation, engineers routinely work on GDS-level data
in environments that don't enforce technology-layer legality. Wrong
layer/purpose pairs, deprecated layers, and reserved-layer leaks are
normally only caught at full signoff or at cross-team handoff, which is
expensive to iterate on. This tool gives any engineer a lightweight,
node-aware check they can run themselves in minutes on a work-in-progress
snapshot.

## How it works

```
   block.gds                baseline_nodeX.yaml   waivers.yaml (optional)
       │                            │                      │
       ▼                            │                      │
 dump_layers.rb (KLayout)           │                      │
       │                            │                      │
       ▼                            ▼                      ▼
   usage.json ───────────► check_violations.py ◄────────────┘
                                    │
                                    ▼
                             violations.json
                                    │
                                    ▼
                          generate_report.sh/.ps1
                              (Claude Code CLI)
                                    │
                                    ▼
                                report.md
```

1. **`scripts/dump_layers.rb`** — runs under KLayout batch mode, reads a
   GDS/OASIS file, and dumps per-layer, per-cell shape usage (name, shape
   count, bounding box in microns) to `usage.json`.
2. **`scripts/check_violations.py`** — compares `usage.json` against a
   `baseline.yaml` (allowed / deprecated / reserved layer/datatype pairs)
   and an optional `waivers.yaml`, producing a machine-readable
   `violations.json`.
3. **`scripts/generate_report.sh` / `.ps1`** — feeds only `violations.json`
   (plus the schema doc) to the Claude Code CLI in headless mode (`claude
   -p`) to produce a plain-language, risk-ranked `report.md`.
4. **`scripts/run_pipeline.sh` / `.ps1`** — runs all three steps back to
   back.

See `docs/violations.schema.md` for the exact `usage.json` /
`violations.json` schema.

## Prerequisites

- [KLayout](https://www.klayout.de/) with batch-mode Ruby scripting
  (`klayout -b`) on `PATH`.
- Python 3 with `PyYAML` (`pip install pyyaml`).
- [Claude Code CLI](https://docs.claude.com/claude-code) (`claude`) on
  `PATH`, for the AI report step.

## Data-handling rule

Only `usage.json` / `violations.json` — already reduced to layer numbers,
cell names, shape counts, and bounding boxes — are ever passed to the AI
step. Raw GDS files and full coordinate dumps are never sent to the model.
If cell names themselves are confidential, hash `cell.name` in
`dump_layers.rb` before extraction.

## Quick start

### 1. Build a baseline

Copy `config/baseline.example.yaml` to e.g. `baseline_nodeX.yaml` and fill
in the real layer/datatype numbers for the target node from its layer map
and technology layer definitions. Commit it to version control — every
check run should be traceable to a baseline revision.

### 2. Run the pipeline

Bash / Linux:
```bash
scripts/run_pipeline.sh block.gds baseline_nodeX.yaml waivers.yaml ./out
```

PowerShell / Windows:
```powershell
scripts\run_pipeline.ps1 -Gds block.gds -Baseline baseline_nodeX.yaml -Waivers waivers.yaml -OutDir .\out
```

Omit the waivers argument entirely if you don't have any yet. This
produces `out/usage.json`, `out/violations.json`, and `out/report.md`.

### 3. Or run it step by step

```bash
klayout -b -r scripts/dump_layers.rb -rd gds=block.gds -rd out=usage.json

python scripts/check_violations.py \
  --usage usage.json --baseline baseline_nodeX.yaml \
  --waivers waivers.yaml --out violations.json

scripts/generate_report.sh violations.json docs/violations.schema.md report.md
```

### 4. Waiving an intentional violation

If a flagged violation is deliberate and documented (e.g. a custom test
structure), add an entry to `waivers.yaml` (copy
`config/waivers.example.yaml` to start):

```yaml
waivers:
  - cell: TESTCELL_A
    layer: 63
    dt: 0
    reason: "Intentional legacy cap for characterization test structure"
    owner: "jdoe"
```

Re-run step 2/3 — the waived `(cell, layer, dt)` triple is dropped from
`violations.json` and counted separately in `waived_count`.

## Validating detection rate

To measure the check engine's detection rate before a pilot (target: ≥95%
of illegal layer/purpose usage on pilot blocks):

1. Take a known-clean GDS and its baseline.
2. Generate mutated copies that seed a known number of layer-legality
   violations (e.g. duplicate a cell's shapes onto a deprecated or
   off-baseline layer/datatype).
3. Run the pipeline on each mutated copy and confirm
   `violations.json.violation_count` matches the seeded count.
4. `detected / seeded` across the mutation set is your detection rate.

## File layout

```
tech-rule-guardrail/
├── SKILL.md                       Claude Code skill definition
├── README.md                      this file
├── config/
│   ├── baseline.example.yaml      legality baseline template
│   └── waivers.example.yaml       waiver list template
├── docs/
│   └── violations.schema.md       usage.json / violations.json schema
└── scripts/
    ├── dump_layers.rb             KLayout batch extraction
    ├── check_violations.py        baseline comparison engine
    ├── generate_report.sh/.ps1    AI report generation
    └── run_pipeline.sh/.ps1       end-to-end orchestration
```

## Roadmap (maps to Proposal A's phases)

- [x] Phase 1 — baseline schema (`config/baseline.example.yaml`), versioned
      via git.
- [x] Phase 2 — extraction (`dump_layers.rb`) + comparison engine
      (`check_violations.py`) → `violations.json`.
- [x] Phase 3 — AI report generation (`generate_report.sh/.ps1`); waiver
      mechanism (`waivers.yaml`).
- [ ] Phase 3 (semi-automated rule authoring) — not yet implemented: paste a
      technology-document excerpt to Claude and have it draft candidate
      `allowed` / `deprecated` / `reserved` baseline entries for human
      review. The `tech-rule-guardrail` skill can do this conversationally
      today; a standalone script isn't needed yet.
- [ ] Phase 4 — pilot with real blocks, tune false positives, integrate into
      the pre-handoff checklist.
