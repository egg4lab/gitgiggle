---
name: tech-rule-guardrail
description: Run the Technology Rule Guardrail pipeline for GDS/OASIS layer-legality checks — extract per-cell layer/datatype usage with KLayout, compare against a versioned technology baseline, apply waivers, and produce an AI-generated plain-language violation report ranked by risk. Use when the user wants to check a block-level GDS for illegal, deprecated, or reserved layer usage before signoff or data handoff, wants to build/update a technology-layer legality baseline, or mentions "layer legality check", "technology rule guardrail", or "layer violation report".
---

# Technology Rule Guardrail

Early, node-aware verification of GDS/OASIS layer usage against a versioned
legality baseline — catching technology-data violations before signoff,
without touching any editor or signoff environment. This is the utility
implementation of Proposal A. The original business case, schedule, and
measurable success criteria are in `PROPOSAL.md`; current implementation
status against that schedule (phase-by-phase and criteria-by-criteria) is
tracked in `README.md`; a verified, runnable step-by-step walkthrough
against this repo's own demo files is in `WALKTHROUGH.md` (PowerShell and
Git Bash variants).

## When to use this skill

- The user has a GDS/OASIS snapshot and wants to know if it uses illegal,
  deprecated, or reserved layers before handing it off.
- The user wants to create or update a technology-layer legality baseline
  for a node.
- The user wants a previously produced `violations.json` triaged or
  explained in plain language.

## Data-handling rule (must follow)

Never paste raw GDS content, full-layout coordinate dumps, or unredacted
internal file paths into a model prompt. The pipeline is designed so that
only the derived, already-sanitized `usage.json` / `violations.json`
summaries (layer, datatype, cell name, shape count, bounding box in microns)
are ever shown to an AI step. If cell names or file paths are themselves
confidential, ask the user whether cell names should be hashed before the
extraction step — `scripts/dump_layers.rb` can be adapted to hash
`cell.name` instead of writing it verbatim.

## Pipeline

1. **Baseline** — confirm a `baseline.yaml` exists for the target node (see
   `config/baseline.example.yaml`). If not, help the user build one from
   their technology layer definitions: allowed layer/purpose pairs,
   deprecated layers, reserved layers. It should be version-controlled so
   every check run is traceable to a baseline revision.
2. **Extract** — run `scripts/dump_layers.rb` under KLayout batch mode to
   produce `usage.json` from the target GDS/OASIS file:
   ```
   klayout -b -r scripts/dump_layers.rb -rd gds=<block.gds> -rd out=usage.json
   ```
3. **Compare** — run `scripts/check_violations.py` to diff `usage.json`
   against the baseline (and an optional `waivers.yaml`), producing
   `violations.json`:
   ```
   python scripts/check_violations.py --usage usage.json --baseline baseline.yaml \
       [--waivers waivers.yaml] --out violations.json
   ```
4. **Explain** — run `scripts/generate_report.sh` (or `.ps1` on Windows) to
   turn `violations.json` into a plain-language, risk-ranked markdown report
   via the Claude Code CLI. Or do this step directly: read `violations.json`
   and `docs/violations.schema.md` yourself and write the Summary / Findings
   by Category / Suggested Fixes / Risk Ranking report inline for the user.
5. **Waive** — if the user confirms a violation is an intentional, documented
   customization, add an entry to `waivers.yaml` (cell, layer, dt, reason,
   owner) and re-run step 3 to confirm the report comes back clean.

Or run the whole thing in one shot:
```
scripts/run_pipeline.sh <gds> <baseline.yaml> [waivers.yaml] [outdir]
scripts/run_pipeline.ps1 -Gds <gds> -Baseline <baseline.yaml> [-Waivers <waivers.yaml>] [-OutDir <dir>]
```

## Output

- `usage.json` — raw per-layer/per-cell extraction (intermediate; not for
  human review).
- `violations.json` — machine-readable violation list (cell, layer/dt,
  category, bbox, rule violated).
- `report.md` — AI-written plain-language summary with suggested fixes and a
  per-block risk ranking.

## Suggesting new baseline rules

When the user pastes a section of a technology document, help draft new
`allowed` / `deprecated` / `reserved` entries in the baseline YAML, but treat
these as a proposal: tell the user a data owner should review and commit
them before they're used in a real check.
