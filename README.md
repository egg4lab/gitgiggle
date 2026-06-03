# GitGiggle

Personal giggler bots, static tools, and automations — published with **GitHub Pages** from the `main` branch (see `.github/workflows/deploy-pages.yml`).

## Published gigglers

| Giggler | URL |
|---------|-----|
| **100 Hour Fasting Journey** | […/gigglers/fasting-tracker/](https://egg4lab.github.io/gitgiggle/gigglers/fasting-tracker/) |
| **Mysore Practice Tracker (Ashtanga)** | […/gigglers/mysore-tracker/](https://egg4lab.github.io/gitgiggle/gigglers/mysore-tracker/) |
| **Office Leave Time Calculator** | […/gigglers/leave-calculator/](https://egg4lab.github.io/gitgiggle/gigglers/leave-calculator/) |

Legacy paths redirect: `/apps/*` and `/helpers/*` → `/gigglers/*`, `/fastingApp/` → `/gigglers/fastingApp/`, `/classReservation/` → `/projects/classReservation/`, `/workHoursApp/` → `/gigglers/workHoursApp/`.

## Repository layout

```
.github/workflows/     # GitHub Actions (Pages deploy)
gigglers/               # AI bots, automations, and static tools
  beeper/              # AI news digest bot
  prana/               # Ashtanga lesson planner bot
  mimemcmarkdown/ …    # Task bot squad (see tools/bot-squad/)
  fasting-tracker/     # Fasting timer (static HTML)
  mysore-tracker/      # Mysore tracker (photos/, videos/ via Git LFS)
  leave-calculator/    # Office leave-time calculator (static HTML)
apps/                  # Legacy redirect stubs (/apps/* → gigglers/)
helpers/               # Legacy redirect stubs (/helpers/* → gigglers/)
projects/
  classReservation/    # Standalone class-reservation demo (static)
fastingApp/            # Tiny HTML redirect → gigglers/fastingApp
classReservation/      # tiny HTML redirect → projects/classReservation
workHoursApp/          # tiny HTML redirect → gigglers/workHoursApp
tools/
  bot-squad/           # Workflow demos for task bots
  bootstrap_task_bots.py
  Enable-GitHubPages.ps1
  virtuoso/            # Cadence/Virtuoso launcher (UNIX/Linux)
```

See [tools/virtuoso/README.md](tools/virtuoso/README.md) for how to run the launcher on your workstation.

### Canonical structure

- Keep bots and tools under `gigglers/`
- Keep project demos under `projects/`
- Keep root-level folders (`fastingApp/`, `classReservation/`, `workHoursApp/`) as redirect-only entry points
- Keep `apps/` and `helpers/` as redirect-only stubs for old GitHub Pages URLs
- Keep scripts/utilities under `tools/`
- Keep local experiments out of publish paths and git tracking

## Git LFS

Practice videos under `gigglers/mysore-tracker/videos/*.mp4` are tracked with **Git LFS** (see `.gitattributes`). Install [Git LFS](https://git-lfs.com/) before cloning or pushing large videos.

## Local preview

Open any `index.html` under `gigglers/` in a browser, or run a static server from the repo root so asset paths resolve correctly.

## Clone

```bash
git clone https://github.com/egg4lab/gitgiggle.git
cd gitgiggle
git lfs install
git lfs pull
```

---

*New Invention for Tool Self-Service.*
