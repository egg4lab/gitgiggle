---
name: static-app-change
description: Safely implement small static site/app updates in this repository
---

# Static App Change Skill

Use this skill when asked to update HTML/CSS/JS in `apps/` or `projects/`.

## Inputs to collect

1. Target app path (for example `apps/leave-calculator/`).
2. Exact behavior/UI change requested.
3. Constraints (mobile layout, style consistency, no new dependencies).

## Execution checklist

1. Read nearby files before editing (`index.html`, local CSS/JS).
2. Make the smallest change that satisfies the request.
3. Keep existing class/id names when possible to avoid regressions.
4. Preserve relative links and asset paths.
5. Avoid adding a build step unless explicitly requested.

## Validation checklist

1. Confirm changed file paths are correct.
2. Confirm no accidental edits outside task scope.
3. If scripts changed, check for obvious console/runtime errors.
4. Summarize:
   - files changed
   - visible behavior changes
   - any follow-up risks
