# Technology Rule Guardrail — AI-Assisted Layer-Usage Verification for Physical Implementation

## Title
Technology Rule Guardrail: early, AI-assisted verification of layer usage at the GDS level, catching technology-data violations before signoff.

## Background & Problem Statement
During physical implementation, engineers frequently work on GDS-level data in environments that do not enforce technology-layer legality. Wrong layer/purpose pairs, deprecated layers, or node-mismatched layers are typically discovered only at signoff verification or at cross-team data handoff, causing expensive late-stage iterations. There is currently no lightweight, node-aware check that any engineer can run in minutes on a work-in-progress GDS snapshot.

## Key Success Factors
1. A complete, versioned **layer-legality baseline** per technology node (layer map + technology layer definitions consolidated into a single source of truth).
2. A **fast batch check** runnable on any GDS/OASIS snapshot, independent of full signoff rule decks — seconds to minutes, not hours.
3. **AI enablement**: violations are not just listed but explained in plain language with suggested corrections, so engineers can self-serve without escalating.
4. **Zero flow disruption**: runs alongside the existing implementation flow; no tool migration or license dependency for end users.

## Criteria (Measurable)
- ≥ 95% detection rate of illegal layer/purpose usage on pilot blocks, validated against a curated known-issue set.
- Batch check runtime ≤ 10 minutes for a typical block-level GDS.
- Every run auto-generates a report: violation list (cell / location / layer) + AI-written summary + suggested fix per violation category.
- ≥ 2 pilot design/layout teams adopting the check as a pre-handoff step; measurable reduction of layer-related rework found at signoff on pilot blocks.

## Project Terms (Action Items)

**Phase 1 — Technology baseline (Week 1–3)**
- Collect and normalize layer maps and technology layer definitions for target nodes.
- Define a legality-rule schema: allowed layer/purpose combinations, deprecated layers, node-specific restrictions, reserved/internal layers.
- Version-control the baseline so every check is traceable to a baseline revision.

**Phase 2 — Check engine (Week 4–7)**
- Implement GDS/OASIS layer-usage extraction (per cell, per hierarchy level).
- Implement comparison engine: extracted usage vs. legality baseline.
- Produce a machine-readable violation database (cell, coordinates, layer/purpose, rule violated).

**Phase 3 — AI enablement (Week 8–10)**
- AI-generated natural-language explanation for each violation category and per-block risk summary.
- AI-suggested corrections (e.g., intended layer candidates based on geometry context and historical fixes).
- AI-assisted authoring: derive new legality rules semi-automatically from technology documents to keep the baseline current.

**Phase 4 — Pilot & rollout (Week 11–14)**
- Run on 2–3 real blocks with pilot teams; tune false positives; add a waiver mechanism for intentional custom usage.
- Deliver user guide and integrate the check into the pre-handoff checklist.

*Schedule includes buffer for planned leave and cross-team coordination.*

## Challenges
- Technology data is scattered and partially customized per project; establishing one trusted baseline requires alignment with data owners.
- Intentional project-specific custom layers will trigger false positives — a documented waiver flow is required.
- GDS from mixed origins (internal, vendor, legacy) may carry inconsistent layer mapping that must be normalized before checking.

## Technical Support Needed
- Read access to layer maps / technology layer definition files for target nodes.
- Sample GDS data from pilot teams plus a known-issue list for validation.
- One Linux compute slot for scheduled batch runs.
- A contact window in each pilot design/layout team for feedback.

## Technical Originality
This project moves technology-rule awareness from the signoff stage back to the editing stage — without modifying any editor or signoff environment. It is a lightweight, node-aware guardrail that any engineer can run on demand, and the AI layer converts raw violations into actionable, teachable guidance, turning every check into implicit training for junior engineers.
