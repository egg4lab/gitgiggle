---
name: ci-troubleshooting
description: Diagnose and fix CI failures with minimal, targeted changes
---

# CI Troubleshooting Skill

Use this skill when tests/builds/lint fail in pull requests or branch checks.

## Inputs to collect

1. Failing workflow/job name.
2. Exact failing command and error output.
3. Scope constraints (fix root cause only, avoid broad refactors).
4. Required checks for merge.

## Execution checklist

1. Reproduce locally with the same command when possible.
2. Identify first root-cause error, not just downstream failures.
3. Apply minimal fix in nearest relevant file/module.
4. Re-run only impacted checks first, then full required checks.
5. Keep non-functional changes (format/refactor) out of the fix unless required.

## Common failure patterns

1. Dependency drift or missing lockfile update.
2. Path/case-sensitivity issues between local and CI.
3. Environment assumptions not true in CI.
4. Flaky tests due to timing or ordering.
5. Changed snapshots/golden files not updated.

## Validation checklist

1. Confirm previously failing command now passes.
2. Confirm no new warnings/errors introduced in related checks.
3. Summarize:
   - root cause
   - exact fix
   - verification commands and results
