---
name: ui-polish
description: Make focused visual and UX improvements to existing static pages
---

# UI Polish Skill

Use this skill when a task is primarily visual, layout, spacing, accessibility, or interaction polish.

## Inputs to collect

1. Target page/component path (for example `apps/mysore-tracker/index.html`).
2. Expected visual outcome (before/after description or screenshot guidance).
3. Constraints:
   - preserve existing content and flow
   - avoid new dependencies/frameworks
   - maintain mobile compatibility

## Execution checklist

1. Inspect current HTML structure and relevant CSS rules before editing.
2. Prefer CSS-only improvements first; use minimal HTML changes only when necessary.
3. Keep typography, spacing, and color changes consistent across nearby sections.
4. Ensure interactive elements remain clear and usable on small screens.
5. Preserve existing route/link and asset path behavior.

## Accessibility quick checks

1. Verify text remains readable against backgrounds.
2. Ensure hover/focus states still work for links and controls.
3. Avoid reducing tap target usability on mobile.

## Validation checklist

1. Confirm visual diff is limited to requested polish scope.
2. Confirm no accidental structural regressions in page layout.
3. Summarize:
   - files changed
   - visible UI improvements
   - any remaining design tradeoffs
