# GitGiggle

Tools and static apps for personal use, published with **GitHub Pages** from the `main` branch (see `.github/workflows/deploy-pages.yml`).

## Published web apps

| App | URL |
|-----|-----|
| **100 Hour Fasting Journey** | […/apps/fastingApp/](https://egg4lab.github.io/gitgiggle/apps/fastingApp/) |
| **Mysore Practice Tracker (Ashtanga)** | […/apps/ashtangaApp/](https://egg4lab.github.io/gitgiggle/apps/ashtangaApp/) |
| **Office Leave Time Calculator** | […/apps/workHoursApp/](https://egg4lab.github.io/gitgiggle/apps/workHoursApp/) |

Legacy paths redirect: `/fastingApp/` → `/apps/fastingApp/`, `/classReservation/` → `/projects/classReservation/`, `/workHoursApp/` → `/apps/workHoursApp/`.

## Repository layout

```
.github/workflows/     # GitHub Actions (Pages deploy)
apps/
  fastingApp/            # Fasting timer & motivation (static HTML)
  ashtangaApp/           # Mysore tracker: index.html, photos/, videos/ (MP4 via Git LFS)
  workHoursApp/          # Office leave-time calculator (static HTML)
projects/
  classReservation/      # Standalone class-reservation demo (static)
fastingApp/              # Tiny HTML redirect → apps/fastingApp
classReservation/        # tiny HTML redirect → projects/classReservation
workHoursApp/            # tiny HTML redirect → apps/workHoursApp
tools/
  Enable-GitHubPages.ps1 # Optional: enable Pages via API (needs PAT)
  virtuoso/
    virtuoso_launcher.tcl  # Tcl/Tk (wish): REF_BASE_LIB + Cadence env, launch Virtuoso (UNIX/Linux)
```

### Canonical published structure

- Keep publishable apps under `apps/`
- Keep project demos under `projects/`
- Keep root-level app folders (`fastingApp/`, `classReservation/`, `workHoursApp/`) as redirect-only entry points
- Keep scripts/utilities under `tools/` (e.g. `tools/virtuoso/` for Cadence/Virtuoso helpers)
- Keep local experiments out of publish paths and git tracking

## Git LFS

Practice videos under `apps/ashtangaApp/videos/*.mp4` are tracked with **Git LFS** (see `.gitattributes`). Install [Git LFS](https://git-lfs.com/) before cloning or pushing large videos.

## Local preview

Open any `index.html` under `apps/` in a browser, or run a static server from the repo root so asset paths resolve correctly.

## Clone

```bash
git clone https://github.com/egg4lab/gitgiggle.git
cd gitgiggle
git lfs install
git lfs pull
```

---

*New Invention for Tool Self-Service.*
