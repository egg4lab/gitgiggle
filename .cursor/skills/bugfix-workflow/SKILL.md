---
name: bugfix-workflow
description: Reproduce bugs and apply minimal, verified fixes
---

# Bugfix Workflow Skill

Use this skill when a bug report describes broken behavior, incorrect output, or runtime errors.

## Inputs to collect

1. Repro steps (what user does, expected result, actual result).
2. Scope boundaries (files/components allowed to change).
3. Verification commands (tests, lint, manual checks).

## Execution checklist

1. Reproduce the issue first and record the failing behavior.
2. Identify root cause before editing code.
3. Apply the smallest safe fix that resolves root cause.
4. Avoid unrelated refactors while fixing the bug.
5. Add or update a regression test when practical.

## Validation checklist

1. Confirm the original repro no longer fails.
2. Run relevant tests and linters for touched areas.
3. Check for side effects in adjacent behavior.
4. Summarize:
   - root cause
   - files changed
   - verification performed
