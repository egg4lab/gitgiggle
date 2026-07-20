# Technology Rule Guardrail — Violation Report

**Node:** gpdk045
**Source:** DiffOpAmp_demo.gds
**Baseline:** baseline_gpdk045.yaml (v1)
**Total violations:** 1 (waived: 0)

## Summary

A single violation was found in cell `DiffOpAmp`: one shape on layer **200/datatype 0**, which the baseline lists under `reserved` as `OPC_KeepOut_PLACEHOLDER`. The shape is small (≈1.5 µm × 0.75 µm bounding box) and appears only once in the block, consistent with a stray marker or leftover annotation rather than a real device layer. No `unknown` or `deprecated` category violations were reported in this run.

## Findings by Category

### Reserved (1 violation)

- **Cell `DiffOpAmp`, layer 200/0, 1 shape, bbox [17.284, 49.56, 18.784, 50.31] µm**
  Layer 200/0 is explicitly marked in the baseline as a **placeholder for this node's OPC (optical proximity correction) keep-out layer** — a tool-reserved layer that must never appear in delivered tapeout data. Its presence here most likely means one of:
  - A leftover OPC/keep-out marker shape that an EDA tool or a manual annotation left behind and was not cleaned up before export.
  - A copy-paste or library-merge artifact that dragged in a shape from a reference/placeholder cell still using the demo layer number.
  - A genuine placement mistake where a shape intended for a real device or routing layer was drawn on layer 200 by habit or fat-finger (e.g., typing "200" instead of a valid metal/via number).

  **Probable intended layer:** Since layer 200/0 is *not* a real GPDK045 layer (per the baseline's own comment, it's a stand-in until the node's true OPC-reserved layer/datatype is known), the most likely intended target is one of the design layers actually present near that geometry — most plausibly a metal or via layer in the `DiffOpAmp` cell's routing stack (e.g., `Metal1`–`Metal11`, layers 7–162) rather than any legitimate use of 200/0 itself. This should be confirmed against the original design intent for that shape, since 200/0 has no valid engineering meaning in this technology.

### Deprecated (0 violations)

None found in this run. No action needed.

### Unknown (0 violations)

None found in this run. No action needed.

## Suggested Fixes

1. **Locate and remove/relocate the layer 200/0 shape** in cell `DiffOpAmp` at bbox `[17.284, 49.56, 18.784, 50.31]` µm. Open the cell in a layout viewer at that coordinate to determine what the shape actually represents.
2. **If the shape is a stray OPC/tool artifact**, delete it before delivery — reserved layers must never ship in tapeout data.
3. **If the shape was meant to represent real geometry**, re-draw it on the correct allowed layer (most likely a metal/via layer already used elsewhere in `DiffOpAmp`) and re-run the guardrail check to confirm the fix clears the violation.
4. **Resolve the baseline placeholder itself**: `baseline_gpdk045.yaml` still has `200/0` marked as `OPC_KeepOut_PLACEHOLDER` — the real OPC-reserved layer/datatype for gpdk045 needs to be confirmed with the design team and substituted so future runs check against the actual reserved number rather than a stand-in.
5. **Add a waiver only if this usage is confirmed intentional** (e.g., a deliberate OPC keep-out marker required by the flow) — otherwise treat as a required fix, not a waive candidate.

## Risk Ranking

| Cell | Violations | Categories | Risk |
|---|---|---|---|
| `DiffOpAmp` | 1 | reserved (1) | **Medium** |

**Rationale:** Only one violating shape exists, keeping the raw count low, but it falls in the `reserved` category — the most serious class, since reserved layers are tool/OPC-only and must never appear in delivered data. A single reserved-layer hit is treated as medium rather than high risk given the low shape count and absence of any `unknown` or `deprecated` findings, but it should still block signoff until root-caused, since reserved-layer content in tapeout data is a hard-stop issue by policy rather than a stylistic concern.
