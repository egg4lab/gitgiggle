```markdown
# Technology Rule Guardrail Report

**Node:** gpdk045
**Source File:** DiffOpAmp.gds
**Baseline:** baseline_gpdk045.yaml (v1)

## Summary

The guardrail check reports **0 violations** and **0 waivers** for `DiffOpAmp.gds` against the `gpdk045` baseline. Every layer/datatype pair drawn in this block matches an entry in the baseline's `allowed` list — no `unknown`, `deprecated`, or `reserved` layer usage was detected. No further analysis or action is required for this block as delivered.

Note: the baseline itself (`baseline_gpdk045.yaml`) is marked **DRAFT**, pending confirmation on a few open points (prBoundary/SEALRING exclusion from tapeout, whether `*dum`/`*dummy` layers should be reclassified as reserved, and the real OPC-reserved layer/datatype number, currently a placeholder at 200/0). A clean result against a draft baseline means the block is consistent with the *current* rules, but the rules themselves may still change.

## Findings by Category

No violations were found in any category for this block.

- **unknown** — 0 findings. (In general, this category flags a `(layer, dt)` pair absent from all three baseline lists — typically a wrong layer/purpose pairing or a mistyped datatype. Not observed here.)
- **deprecated** — 0 findings. (This category flags layers that were once legal but have since been retired. The baseline's `deprecated` list is currently empty for this node, so this category cannot fire until deprecated layers are added.)
- **reserved** — 0 findings. (This category flags tool/annotation-only layers — e.g. `text`, `prBoundary`, `PO_text`, `LOGO`, `VIAEXCL`, and the placeholder `OPC_KeepOut_PLACEHOLDER` — that should never appear in delivered data. None were present in this block.)

## Suggested Fixes

No fixes are required for `DiffOpAmp.gds`. Recommended follow-ups are at the baseline level rather than the block level:

- Confirm with the design team whether `prBoundary` (99/0) and `SEALRING` (66/0) should truly be excluded from tapeout delivery, and update the `reserved`/`allowed` classification accordingly.
- Decide whether `*dum`/`*dummy` layers (e.g. `Capdum`, `INDdummy`, `M1Resdum`, etc.) should move from `allowed` to `reserved` if they are tool-internal only.
- Replace the placeholder OPC layer (`200/0`, `OPC_KeepOut_PLACEHOLDER`) with the real OPC-reserved layer/datatype number for this node once known, so future runs can actually catch stray OPC-layer leakage.

## Risk Ranking

| Block | Violation Count | Categories Present | Risk |
|---|---|---|---|
| DiffOpAmp.gds | 0 | none | **Low** |

No blocks are at medium or high risk in this dataset.
```
