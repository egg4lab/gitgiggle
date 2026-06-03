# 100 Hour Fasting Journey

A web application to track and support your 100-hour fasting journey with a live countdown timer, progress visualization, motivational messages, and helpful tools for politely declining food offers.

## Published App

**https://egg4lab.github.io/gitgiggle/gigglers/fasting-tracker/**

## GitHub Sync

Fasting state is stored in `fasting-state.json` in this folder and can sync across browsers/devices via GitHub.

### How it works

- **On load:** The app fetches `fasting-state.json` from GitHub and merges it with local browser data (newer `updatedAt` wins; active sessions take priority when timestamps differ).
- **On change:** Starting, ending, or completing a fast updates localStorage and pushes to the repo (if a token is configured).
- **Without a token:** The app still works locally and can read the public JSON file, but cannot write to GitHub.

### Setup (one-time)

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with the **`repo`** scope (classic token) or **Contents: Read and write** on the target repository (fine-grained token).
2. Open the app and scroll to **GitHub Sync**.
3. Paste your token and click **Save Settings**. Defaults target `egg4lab/gitgiggle` on branch `main`.
4. Use **Sync Now** to merge immediately, or just use the app — changes sync automatically when you start or end a fast.

The token is stored only in your browser's localStorage and is never committed to the repo.

After deploying `fasting-state.json` to GitHub Pages, all devices can read the same state; only devices with a valid token can push updates.

---

*Part of the [GitGiggle](https://github.com/egg4lab/gitgiggle) repository.*
