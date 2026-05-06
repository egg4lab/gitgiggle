# AGENT.md

This file provides default guidance for AI agents working in this repository.

## Repository intent

GitGiggle hosts static web apps and tooling scripts:

- `apps/` for publishable apps
- `projects/` for project demos
- `tools/` for scripts and utilities

## Working rules

1. Keep changes minimal and focused on the requested task.
2. Preserve static-site behavior (no unnecessary framework/toolchain changes).
3. Do not move app folders unless explicitly requested.
4. Prefer small, readable HTML/CSS/JS edits over broad refactors.
5. Avoid adding heavy dependencies for simple static features.

## Safety checks before finishing

1. Verify links and asset paths still resolve from repo root.
2. Confirm no accidental edits in unrelated directories.
3. Summarize changed files and user-visible behavior.

## Pull request expectations

- Use clear titles with the feature/fix scope.
- Include a short test/verification note.
- Call out risks (path changes, redirects, media updates).
