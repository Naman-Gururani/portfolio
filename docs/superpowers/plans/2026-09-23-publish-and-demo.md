# Publish & Demo Implementation Plan

> **Status (2026-09-25):** executed 2026-09-23 in the order written. Two departures: the stats-card workflow was not dispatched by hand (a run without `METRICS_TOKEN` would have replaced the private-inclusive snapshot), and the videos were recorded with `scratch/demo/walkthrough.cjs` and `encode.cjs` instead of Task 6's `record.cjs`, using an `ffmpeg-static` binary because Playwright's cached ffmpeg is broken on this machine. Every deviation from it, and why, is in `docs/superpowers/2026-09-23-rulings.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. This plan is a runbook — it changes the live site, so it runs in one sitting, in order, **only after the user's explicit go-ahead**. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Publish all three repositories, rename `lineage` → `portfolio` through the GitHub API, verify the live result, then record the walkthrough video.

**Architecture:** The rename is the only irreversible-feeling step and the only one with a visible outage window, so everything else is staged first: the site is pushed while its `/lineage/` redirect is still shadowed by the project repo, then the rename flips both at once, then the game is deployed to the new path.

**Tech Stack:** git, GitHub REST API, `gh-pages`, `playwright-core` + ffmpeg.

**Spec:** `docs/superpowers/specs/2026-09-14-guide-printstream-profile-design.md` (§B2, §B3, §E)

## Global Constraints

- **Do not start this plan without the user's go-ahead for publishing.** The three build plans stop at local commits.
- The token for the API call comes from `git credential fill` for `github.com`, used in-process only. It is never echoed, never written to a file, never passed on a command line that gets logged. Redact it from any output pasted into a report.
- Between the rename and the game deploy, `/portfolio/` 404s. Keep that window to minutes: have `dist/` already built before step 3.
- Verify with real requests, not assumptions: an HTTP status and a rendered page, screenshot as evidence.

## Review Focus

1. **The rename hitting a name that is taken.** `portfolio` is free today; if the API returns 422, stop and report — do not invent a second name.
2. **Pages losing its source.** A project rename keeps the `gh-pages` branch, but confirm Pages is still enabled and serving from it, and that the custom path resolves.
3. **The old URL.** `/lineage/` must serve the redirect, not GitHub's 404, once both pushes land.
4. **Saved games.** A returning player's save is keyed to the origin, which does not change, so `Continue` must still work at the new path.
5. **The video showing debug UI.** No `?cheat=1` Skip buttons in frame; use the real "show me" reveal buttons.

---

### Task 1: Stage everything

- [ ] **Step 1: Confirm each repo is clean and green**

```bash
cd C:/AntiG/lineage && git status --short && npx vitest run && npx tsc --noEmit && npm run build
cd C:/AntiG/naman-gururani.github.io && git status --short && npm test && npm run build
cd C:/AntiG/github-profile && git status --short && npm test
```
Expected: three clean trees, all gates green, `C:/AntiG/lineage/dist/index.html` referencing `/portfolio/`.

- [ ] **Step 2: Sync the profile repo**

`cd C:/AntiG/github-profile && git pull --rebase` — the blog bot commits here.

---

### Task 2: Push the site

- [ ] **Step 1: Push**

```bash
cd C:/AntiG/naman-gururani.github.io && git push origin main
```

- [ ] **Step 2: Watch the deploy**

The repo deploys through `.github/workflows/deploy.yml`. Poll until it succeeds, then `curl -I https://naman-gururani.github.io/` returns 200 and the page shows the Printstream hero.

- [ ] **Step 3: Confirm `/lineage/` is still the game**

`curl -I https://naman-gururani.github.io/lineage/` → 200, still the old build. The redirect is shadowed by the project repo, exactly as designed.

---

### Task 3: Rename the repo

- [ ] **Step 1: Read the token**

```bash
printf 'protocol=https\nhost=github.com\n\n' | git credential fill
```
Take `password=` from the output. Do not print it again.

- [ ] **Step 2: Rename**

```bash
curl -sS -X PATCH https://api.github.com/repos/Naman-Gururani/lineage \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  -d '{"name":"portfolio","description":"Naman'\''s World Fair — an explorable pixel-art game that is also my portfolio. Vite · TypeScript · Phaser 3 · Web Audio.","homepage":"https://naman-gururani.github.io/portfolio/"}'
```
Expected: 200 with `"name": "portfolio"`. On 422, stop and report.

- [ ] **Step 3: Repoint the local clones**

```bash
git -C C:/AntiG/lineage remote set-url origin https://github.com/Naman-Gururani/portfolio.git
git -C C:/AntiG/lineage-ghpages remote set-url origin https://github.com/Naman-Gururani/portfolio.git
```

- [ ] **Step 4: Push the game's branches**

```bash
cd C:/AntiG/lineage && git push origin main && git push origin v3/story-isle
```

---

### Task 4: Deploy the game

- [ ] **Step 1: Deploy**

```bash
cd C:/AntiG/lineage && npm run build && npx gh-pages -d dist
```

- [ ] **Step 2: Verify Pages**

```bash
curl -sS -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/Naman-Gururani/portfolio/pages
```
Expected: `"status": "built"`, source branch `gh-pages`.

- [ ] **Step 3: Verify the live URLs**

- `https://naman-gururani.github.io/portfolio/` → 200, title screen loads, no console errors.
- `https://naman-gururani.github.io/lineage/?fresh=1` → lands on `/portfolio/?fresh=1`.
- A save made before the move still offers **Continue**.

---

### Task 5: Push the profile

- [ ] **Step 1: Push**

```bash
cd C:/AntiG/github-profile && git push origin main
```

- [ ] **Step 2: Run the workflows once**

```bash
curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Naman-Gururani/Naman-Gururani/actions/workflows/cards.yml/dispatches -d '{"ref":"main"}'
```
Same for `snake.yml`. Poll both runs to completion, then reload `https://github.com/Naman-Gururani` and confirm every image renders (not a broken-image icon) in both colour schemes.

---

### Task 6: Record the walkthrough

**Files:** Create `C:/AntiG/lineage/scratch/demo/record.cjs`, output to `scratch/demo/*.mp4`

- [ ] **Step 1: Get ffmpeg**

`npx playwright install ffmpeg` (or `npm i -D ffmpeg-static` inside `scratch/demo`). Confirm a binary path before recording.

- [ ] **Step 2: Write the script**

`record.cjs` drives `playwright-core` from the npx cache with `recordVideo: { dir, size }`, one context per cut:

- **Cut 1 — desktop 1280×720:** homepage, both skins, slow scroll → click **Play the portfolio** → welcome card → Start → Bo's arrival and the About card → Wordle, solved via *Show me the word* → turnstiles lift → **Missions** sheet → *Take me there* to the coaster → the ride, advancing each milestone card → Career card → Prize Tent claw (reveal) → Word Forge (reveal) → tech-stack card → Guestbook → finale banner → map → Reader Mode.
- **Cut 2 — phone 390×844, `hasTouch`, `isMobile`:** walking with the stick, the action button changing verb and blinking, Missions → Take me there, one game on touch.
- **Cut 3 — 1280×720:** `https://github.com/Naman-Gururani`, slow scroll top to bottom.

Pace it for a viewer: `waitForTimeout` beats between actions, no `?cheat=1`.

- [ ] **Step 3: Record and convert**

```bash
node scratch/demo/record.cjs
```
Then convert each `.webm` to `.mp4` (H.264, yuv420p, faststart) and name them `naman-portfolio-desktop.mp4`, `naman-portfolio-phone.mp4`, `naman-github-profile.mp4`.

- [ ] **Step 4: Watch them**

Check each file plays, has no dead air longer than ~3 s, no debug UI, and no half-loaded frames at the start.

- [ ] **Step 5: Hand them over**

Send the files to the user's device with SendUserFile, and report their durations and sizes.

---

### Task 7: Close out

- [ ] **Step 1:** Update `docs/HANDOFF.md` in the game repo — new URL, the guidance systems, the three deploys, the video.
- [ ] **Step 2:** Update the memory file `project-lineage-isle-redesign.md` with the new repo name, live URL and state.
- [ ] **Step 3:** Report to the user: what is live, the two GitHub settings only they can change (*Include private contributions*, pinning `portfolio` on the profile), and where the videos are.
