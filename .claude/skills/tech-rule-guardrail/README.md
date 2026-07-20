# Technology Rule Guardrail

Early, AI-assisted verification of GDS/OASIS layer usage against a
versioned technology-layer legality baseline — catching illegal,
deprecated, or reserved layer usage before signoff or data handoff, in
minutes, without modifying any editor or signoff environment.

This is the utility implementation of **Proposal A** — see `PROPOSAL.md`
in this same directory for the full business write-up, schedule, and
measurable success criteria. It is also registered as a Claude Code skill
(`SKILL.md`) so an assistant can drive the pipeline on request.

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

## Roadmap

Mirrors `PROPOSAL.md`'s phases and week numbering exactly, so status here
is directly traceable back to the schedule that was committed to.

**Phase 1 — Technology baseline (Week 1–3)**
- [x] Legality-rule schema defined: `allowed` / `deprecated` / `reserved`
      layer-datatype pairs (`config/baseline.example.yaml`).
- [x] Version-controlled — every check is traceable to a baseline revision
      via git.
- [x] First real baseline built from an actual node's layer map:
      `config/baseline_gpdk045.yaml`, derived from `Input_Data/gpdk045.layermap`.
- [ ] Collecting/normalizing layer maps across multiple target nodes — only
      one (demo) node covered so far; real production nodes not yet added.

**Phase 2 — Check engine (Week 4–7)**
- [x] GDS/OASIS layer-usage extraction, per cell (`scripts/dump_layers.rb`,
      KLayout batch mode).
- [x] Comparison engine: extracted usage vs. baseline
      (`scripts/check_violations.py`).
- [x] Machine-readable violation database (`violations.json`: cell, bbox
      coordinates, layer/datatype, rule violated).
- [x] Windows portability verified on both entry points: `klayout.exe` is a
      GUI-subsystem binary that doesn't block on a bare call from
      PowerShell (fixed via `Start-Process -Wait` in `run_pipeline.ps1`,
      not needed in bash which blocks correctly on its own); paths
      containing a space-hyphen-space (e.g. an `OneDrive - <org>` folder)
      broke naive PowerShell argument passing (fixed via a single
      pre-quoted argument string); `python3` isn't registered by the
      Windows Python.org installer (fixed via a `python3`→`python`
      fallback in `run_pipeline.sh`).
- [ ] Per-*hierarchy-level* extraction, as distinct from per-cell — current
      extraction is per-cell across the flattened read, not yet
      hierarchy-depth-aware.

**Phase 3 — AI enablement (Week 8–10)**
- [x] AI-generated natural-language explanation per violation category plus
      a per-block risk summary (`scripts/generate_report.ps1/.sh` →
      `report.md`).
- [~] AI-suggested corrections: current implementation infers a plausible
      intended layer from category + baseline context; not yet using
      geometry-context or historical-fix data specifically, as the proposal
      describes.
- [ ] AI-assisted authoring of new baseline rules from technology
      documents, as a standalone script — the `tech-rule-guardrail` skill
      can already do this conversationally today (paste a doc excerpt, get
      draft baseline entries for human review), which was judged sufficient
      for now over building a dedicated script.

**Phase 4 — Pilot & rollout (Week 11–14)**
- [x] Waiver mechanism for intentional custom usage (`waivers.yaml`,
      `--waivers` flag, `waived_count` in output).
- [x] User guide delivered: `WALKTHROUGH.md`, step-by-step, with both
      PowerShell and Git Bash variants, verified by actually running every
      command before writing it down.
- [~] Run on real blocks: one real block (`Input_Data/DiffOpAmp.gds`)
      exercised end-to-end — a clean run (0 violations) and a deliberately
      mutated copy simulating a designer drawing on a layer without
      realizing it's OPC-reserved (1/1 correctly caught, nothing else
      mis-flagged). This is a mechanism validation, not yet the "2–3 real
      blocks with pilot teams" the proposal calls for.
- [ ] False-positive tuning against pilot teams — not started, no pilot
      teams engaged yet.
- [ ] Integration into the pre-handoff checklist — not done.

## Measurable criteria status

Per the "Criteria (Measurable)" section of `PROPOSAL.md`:

- **≥ 95% detection rate**, validated against a curated known-issue set —
  not yet formally measured. The "Validating detection rate" section below
  describes the method; only a single-violation synthetic injection has
  been demonstrated so far (1/1 caught), which is not a statistically
  meaningful sample.
- **Batch check runtime ≤ 10 minutes** — comfortably met on the one real
  block tested (full pipeline completes in well under a minute); not yet
  benchmarked on larger production-scale blocks.
- **Every run auto-generates a report** (violation list + AI summary +
  suggested fix) — met; demonstrated in both
  `Input_Data/guardrail_out_good/` and `guardrail_out_bad/`.
- **≥ 2 pilot design/layout teams adopting** — not started; zero pilot
  teams engaged so far.
