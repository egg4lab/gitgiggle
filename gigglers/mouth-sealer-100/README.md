# 封口百日戰術小工具 Mouth-Sealer 100

A tactical night-eating deterrent and 100-day weight-trend tracker. Tracks a weekday/weekend feeding-window schedule (13:00–16:00 on weekdays, 13:00–16:00 or 19:00–22:00 on weekends, hard seal at 16:30 on weekdays), a countdown to the next window change, a "press to resist a craving" button with a 60-second cooldown ritual, morning weigh-in check-ins that auto-judge the previous day pass/fail, a 7/30/100-day weight trendline chart, and a library of roast/hype/fail quotes.

## Published App

**https://egg4lab.github.io/gitgiggle/gigglers/mouth-sealer-100/**

## Data storage

State (daily weights, nightly craving-button presses) is stored in the browser's `localStorage` under the key `ms100-data`. Use **清除全部資料** in the footer to wipe it (this also pushes the wipe to GitHub if sync is configured).

## GitHub Sync

Data can sync across browsers/devices via `ms100-state.json` in this folder, using the same pattern as [`fasting-tracker`](../fasting-tracker/).

### How it works

- **On load:** the app fetches `ms100-state.json` from GitHub and merges it with local browser data. Merge is per-date: weight/press entries are unioned by date across both sides, and only a genuine same-date conflict is resolved by which side's `updatedAt` is newer — so logging a weigh-in on your phone and a craving-button press on your laptop before either syncs won't clobber each other.
- **On change:** logging a weight, pressing "按死它", or wiping data updates `localStorage` and pushes to the repo (if a token is configured).
- **Without a token:** the app still works locally and can read the public JSON file, but cannot write to GitHub.

### Setup (one-time, per device)

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with the **`repo`** scope (classic token) or **Contents: Read and write** on the target repository (fine-grained token).
2. Open the app and scroll to **雲端同步 GitHub Sync**.
3. Paste your token and click **儲存設定**. Defaults target `egg4lab/gitgiggle` on branch `main`.
4. Use **立即同步** to merge immediately, or just use the app — changes sync automatically after you log a weight or press the button.

The token is stored only in this device's browser `localStorage` (under keys namespaced `ms100Github*`, distinct from other gigglers' sync settings) and is never committed to the repo.

## Use as a phone app

Open the published link in Safari (iOS) or Chrome (Android) and use **Add to Home Screen**. The page includes `apple-mobile-web-app-capable` and `theme-color` meta tags so it opens without browser chrome, like a standalone app.

---

*Part of the [GitGiggle](https://github.com/egg4lab/gitgiggle) repository.*
