```markdown
# Layer Legality Violation Report

**Node:** gpdk045
**Source file:** DiffOpAmp_demo_v2.gds
**Baseline:** baseline_gpdk045.yaml
**Total violations:** 1 (0 waived)

## Summary

A single layer-legality violation was found, in cell **DiffOpAmp**, on layer **69/0**. The offending shape is 1 polygon covering a small region (~1.25 µm × 0.6 µm) at bbox `(23.7655, 1.505) – (25.0155, 2.105)`. It falls under the **reserved** category — layer 69/0 is designated for internal tool/OPC use only and must never appear in data handed off for tapeout. No `unknown` or `deprecated` violations were found in this run.

## Findings by Category

### Reserved (1 violation)

Layer 69/0 is marked `reserved` in the baseline as a stand-in for this node's OPC/RET tool-annotation layer (see baseline comment: `FUSE_pretend_OPC`). In the real GPDK045 layer map, layer 69 is natively named **FUSE**, so two plausible root causes exist:

1. **Legitimate FUSE-purpose geometry.** If the designer genuinely intended a fuse/trim structure, this shape is real design data that happens to collide with the reserved slot this baseline temporarily assigned for demo/OPC purposes. In a production baseline (once the real OPC-reserved layer/datatype is confirmed and added separately), this shape would likely be legal again.
2. **Leaked tool/annotation geometry.** More consistent with the "reserved" classification's intent, a shape on a reserved layer inside a delivered cell is a classic sign of stray tool output — e.g., an OPC/RET pass, a ruler/annotation, or a copy-paste from a reference cell that wasn't cleaned up before checking in the cell.

**Probable intended layer:** Given the tiny shape size and its placement inside an analog op-amp cell (not a fuse-bank cell), this is more likely case 2 — an accidental/leftover annotation shape. If fuse structures were genuinely intended, the probable correct layer is still **69/0 (FUSE)** once the baseline's temporary OPC repurposing is resolved with the real tool-reserved layer number; until then, this shape should not ship as-is.

### Deprecated (0 violations)

No violations in this category for this run. Deprecated violations occur when a layer that used to be legal has since been retired in favor of a newer equivalent (e.g., an old fill or via layer superseded by a redrawn one). Had one appeared, the probable intended layer would be the successor layer named in the baseline's `deprecated` mapping for that entry — none is currently populated (the baseline's `deprecated:` list is empty).

### Unknown (0 violations)

No violations in this category for this run. Unknown violations occur when a `(layer, dt)` pair doesn't match anything in `allowed`, `deprecated`, or `reserved` — typically a fat-fingered datatype (e.g., `dt: 4` used where only `dt: 0/1/2/3/5` are defined for a metal) or a layer number transposed/mistyped from an adjacent one. Had one appeared, the probable intended layer would usually be inferred by finding the nearest valid `(layer, dt)` combination for the same drawn purpose (e.g., matching the correct `purposes:` datatype on the same metal layer).

## Suggested Fixes

1. **DiffOpAmp / layer 69/0 (1 shape):** Inspect the shape at bbox `(23.7655, 1.505)–(25.0155, 2.105)` in KLayout. If it is leftover tool/annotation geometry, delete it. If it is intentional fuse-related design data, hold it out of tapeout delivery until the design team confirms (a) whether GPDK045's real OPC-reserved layer/datatype should occupy a different number than 69, and (b) whether FUSE (69/0) should be moved to `allowed` in a future baseline revision. Do not add a waiver for this without design-team sign-off, since `reserved` layers are meant to never reach delivered data.
2. **Baseline maintenance (not this block, but blocking accurate triage):** The baseline file is explicitly marked DRAFT and notes the real OPC-reserved layer/datatype for gpdk045 is unknown and layer 69 is only a placeholder. Resolving that placeholder will make future `reserved`-category calls on layer 69 unambiguous.

## Risk Ranking

| Block/Cell | Violations | Categories | Risk |
|---|---|---|---|
| DiffOpAmp | 1 | reserved (1) | **High** |

Rationale: even a single `reserved`-category hit is scored High — by definition these are layers that must never appear in delivered data, so any occurrence blocks signoff regardless of shape count. No `deprecated` or `unknown` findings were present to otherwise moderate the block's risk.
```
