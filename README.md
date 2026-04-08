# GitGiggle

Tools and static apps for personal use, published with **GitHub Pages** from the `main` branch (see `.github/workflows/deploy-pages.yml`).

## Published web apps

| App | URL |
|-----|-----|
| **100 Hour Fasting Journey** | […/apps/fastingApp/](https://egg4lab.github.io/gitgiggle/apps/fastingApp/) |
| **Mysore Practice Tracker (Ashtanga)** | […/apps/ashtangaApp/](https://egg4lab.github.io/gitgiggle/apps/ashtangaApp/) |

Legacy paths redirect: `/fastingApp/` → `/apps/fastingApp/`, `/classReservation/` → `/projects/classReservation/`.

## Repository layout

```
.github/workflows/     # GitHub Actions (Pages deploy)
apps/
  fastingApp/            # Fasting timer & motivation (static HTML)
  ashtangaApp/           # Mysore tracker: index.html, photos/, videos/ (MP4 via Git LFS)
projects/
  classReservation/      # Standalone class-reservation demo (static)
fastingApp/              # Tiny HTML redirect → apps/fastingApp
classReservation/        # tiny HTML redirect → projects/classReservation
tools/
  Enable-GitHubPages.ps1 # Optional: enable Pages via API (needs PAT)
```

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
