The violations.json file has zero violations (`violation_count: 0`, `waived_count: 0`, empty `violations` array) for `DiffOpAmp.gds` against `baseline_gpdk045.yaml`. The report should reflect a clean result.

# Technology Rule Guardrail Report

**Node:** gpdk045
**Source file:** DiffOpAmp.gds
**Baseline:** baseline_gpdk045.yaml
**Violations found:** 0
**Waived:** 0

## Summary

No layer legality violations were detected in `DiffOpAmp.gds` when checked against `baseline_gpdk045.yaml`. Every layer/datatype pair used in this block's cells falls within the baseline's `allowed` list — nothing matched the `unknown`, `deprecated`, or `reserved` categories, and no waivers were needed. This block is clean and ready to proceed toward signoff/handoff from a layer-legality standpoint.

## Findings by Category

**Unknown layers** — None found. No (layer, dt) pairs appeared that are absent from the baseline's `allowed`, `deprecated`, and `reserved` lists, so there's no indication of fat-fingered datatypes or mis-mapped layer/purpose pairs in this data.

**Deprecated layers** — None found. No shapes were drawn on layers the baseline marks as superseded/retired, so there's no legacy-layer cleanup needed for this block.

**Reserved layers** — None found. No shapes were drawn on layers reserved for internal/tool use, so there's no indication of stray tool-generated geometry or accidental use of a reserved layer/purpose pair leaking into delivered data.

## Suggested Fixes

None required. No entries need remapping to a different layer/purpose pair, no deprecated-layer migration is needed, and no reserved-layer geometry needs to be stripped or investigated.

## Risk Ranking

| Block | Violation Count | Categories Present | Risk |
|---|---|---|---|
| DiffOpAmp.gds | 0 | none | **Low** |

**Overall risk: Low.** This block passed the layer legality check cleanly against the current baseline revision (`baseline_gpdk045.yaml`). No further action is needed unless the baseline itself is updated, in which case this block should be re-checked against the new revision.
