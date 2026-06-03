# GitGiggle

Personal helper bots, static tools, and automations — published with **GitHub Pages** from the `main` branch (see `.github/workflows/deploy-pages.yml`).

## Published web helpers

| Helper | URL |
|--------|-----|
| **100 Hour Fasting Journey** | […/helpers/fasting-tracker/](https://egg4lab.github.io/gitgiggle/helpers/fasting-tracker/) |
| **Mysore Practice Tracker (Ashtanga)** | […/helpers/mysore-tracker/](https://egg4lab.github.io/gitgiggle/helpers/mysore-tracker/) |
| **Office Leave Time Calculator** | […/helpers/leave-calculator/](https://egg4lab.github.io/gitgiggle/helpers/leave-calculator/) |

Legacy paths redirect: `/apps/*` → `/helpers/*`, `/fastingApp/` → `/helpers/fastingApp/`, `/classReservation/` → `/projects/classReservation/`, `/workHoursApp/` → `/helpers/workHoursApp/`.

## Repository layout

```
.github/workflows/     # GitHub Actions (Pages deploy)
helpers/               # AI bots, automations, and static helper tools
  beeper/              # AI news digest bot
  prana/               # Ashtanga lesson planner bot
  mimemcmarkdown/ …    # Task bot squad (see tools/bot-squad/)
  fasting-tracker/     # Fasting timer (static HTML)
  mysore-tracker/      # Mysore tracker (photos/, videos/ via Git LFS)
  leave-calculator/    # Office leave-time calculator (static HTML)
apps/                  # Legacy redirect stubs only (old /apps/* GitHub Pages URLs)
projects/
  classReservation/    # Standalone class-reservation demo (static)
fastingApp/            # Tiny HTML redirect → helpers/fastingApp
classReservation/      # tiny HTML redirect → projects/classReservation
workHoursApp/          # tiny HTML redirect → helpers/workHoursApp
tools/
  bot-squad/           # Workflow demos for task bots
  bootstrap_task_bots.py
  Enable-GitHubPages.ps1
  virtuoso/            # Cadence/Virtuoso launcher (UNIX/Linux)
```

See [tools/virtuoso/README.md](tools/virtuoso/README.md) for how to run the launcher on your workstation.

### Canonical structure

- Keep bots and helper tools under `helpers/`
- Keep project demos under `projects/`
- Keep root-level folders (`fastingApp/`, `classReservation/`, `workHoursApp/`) as redirect-only entry points
- Keep `apps/` as redirect-only stubs for old GitHub Pages URLs
- Keep scripts/utilities under `tools/`
- Keep local experiments out of publish paths and git tracking

## Git LFS

Practice videos under `helpers/mysore-tracker/videos/*.mp4` are tracked with **Git LFS** (see `.gitattributes`). Install [Git LFS](https://git-lfs.com/) before cloning or pushing large videos.

## Local preview

Open any `index.html` under `helpers/` in a browser, or run a static server from the repo root so asset paths resolve correctly.

## Clone

```bash
git clone https://github.com/egg4lab/gitgiggle.git
cd gitgiggle
git lfs install
git lfs pull
```

---

*New Invention for Tool Self-Service.*
