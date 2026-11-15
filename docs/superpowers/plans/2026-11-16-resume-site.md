# v6 résumé site: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/portfolio/` serves a glass "holo credential" résumé page built from one fact file. The game moves to `/portfolio/play/`. The homepage and GitHub profile are aligned with both.

**Architecture:** a Vite multi-page build in the game repo. A build-time plugin renders the résumé HTML from `src/data/resume.ts` through a pure `renderResume()`, so the page is complete without JS. A tiny `src/resume/main.ts` adds the motion and controls. The sibling repos change in their own branches.

**Tech stack:** Vite 6, TypeScript 5, vitest 4 + happy-dom, `@fontsource` (Geist, Inter, JetBrains Mono), `playwright-core` for screenshots.

**Spec:** `docs/superpowers/specs/2026-11-16-resume-site-design.md`. Read §2, §3 and §5 before any task.

## Global constraints

- Every fact comes from §3 of the spec. If a fact is not there, it does not go on the page.
- The rendered résumé must never match `/IELTS|TOEFL|\bGRE\b|admission|applying|application|Cornell|Carnegie|Berkeley|Toronto|Waterloo|Georgia Tech|UIUC|open to work|seeking|hire me|prospective/i`.
- Option B for bank detail:
  - Scale is an order of magnitude ("hundreds of millions", "about 20").
  - No internal system, team or project names.
  - The legacy stack is "a legacy batch ETL stack".
- The title is exactly `Data and Backend Engineer`. CGPA is exactly `9.63 / 10`. The rank is exactly "top 5% of rank holders, B.Tech CSE, batch 2020–2024". No cohort size.
- No hosted PDF. Print is `window.print()`.
- Dark is the default. The page's own storage key is `pf.theme` (`dark` | `light`).
- JS for the résumé is at most 15 KB min. No framework. The game bundle never loads on `/portfolio/`.
- Every decorative motion sits behind `@media (prefers-reduced-motion: no-preference)`.
- Never commit to `main`; work on `v6/resume`. No push or deploy without Naman's go.

## Review focus

1. **An old game link with flags** (`/portfolio/?fresh=1&cheat=1#x`) must land in the game with its query and hash intact. A plain `/portfolio/` must stay on the résumé. Tested in Task 1.
2. **JS off, or the script fails.** All facts, links and sections must still be visible, and no element may start invisible waiting for JS. Tested in Task 3: the rendered HTML carries every fact, and the CSS has no `opacity:0` outside a motion guard.
3. **Print** must be white, show every `<details>` open, and hide the scene, navigation and banner. Checked in Task 6 through a print-media screenshot.
4. **Narrow phones (360px).** No horizontal scroll, the nav row scrolls, the hero card fits. Checked in Task 6 through a screenshot and a `scrollWidth <= innerWidth` assertion.
5. **The game's facts must not drift from the résumé.** Tested in Task 7: `content.ts` imports `PROFILE`, the title, the dates and the CGPA from `resume.ts`.

---

### Task 1: Multi-page build, and the game moves to /play/

**Files:**
- Move: `index.html` → `play/index.html` (`git mv`). Its script src stays `/src/main.ts`; its canonical and `og:url` become `https://naman-gururani.github.io/portfolio/play/`.
- Create: `index.html` (the résumé shell, with a `<!--resume-->` marker in `<body>` and `<!--resume-head-->` in `<head>`)
- Create: `src/resume/forward.ts`
- Modify: `vite.config.ts` (add `build.rollupOptions.input = { main: 'index.html', play: 'play/index.html' }`)
- Modify: `tests/index-html.test.ts` (read `../play/index.html`)
- Test: `tests/resume-forward.test.ts`

**Interfaces:**
- Produces: `GAME_FLAGS = ['fresh','cheat','word','duck','st'] as const`, and `gameForward(search: string, hash: string): string | null`, which returns `'/portfolio/play/' + search + hash` when any flag is present, else `null`.
- The résumé `index.html` inlines the same check as a `<script>` in `<head>` (before any paint). It is kept in sync by a test that evaluates the inline script's source against the same cases.

- [ ] Step 1: write `tests/resume-forward.test.ts`:
  - `gameForward('?fresh=1&cheat=1','#top') === '/portfolio/play/?fresh=1&cheat=1#top'`
  - `gameForward('?word=kafka','') === '/portfolio/play/?word=kafka'`
  - `gameForward('','') === null`
  - `gameForward('?utm_source=cv','') === null`
  - `gameForward('?st','') !== null`
  - An inline-script test: read `index.html`, extract the `<script data-forward>` body, run it against a fake `location` (`{search, hash, replace}`) for the cases above, and expect the same targets.
- [ ] Step 2: run `npx vitest run tests/resume-forward.test.ts`. Expect it to FAIL.
- [ ] Step 3: implement `forward.ts`, the two HTML files and the Vite input.
- [ ] Step 4: run `npx vitest run && npx tsc --noEmit && npm run build`. Expect green, with `dist/index.html` and `dist/play/index.html` both present, and `dist/index.html` not referencing the phaser chunk.
- [ ] Step 5: commit with `feat(resume): /portfolio/ becomes the résumé shell; the game moves to /portfolio/play/`.

### Task 2: The fact file

**Files:**
- Create: `src/data/resume.ts`
- Test: `tests/resume-data.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Link = { label: string; href: string }
  export type Role = { title: string; grade?: string; from: string; to: string | null; note?: string } // from/to 'YYYY-MM' | 'YYYY'
  export type Bullet = { lead: string; text: string; how?: string[]; tags?: string[] }
  export type Project = { id: string; name: string; kicker: string; when?: string; role: string; summary: string; points: string[]; stack: string[]; links: Link[]; size: 'lg' | 'md' }
  export type Metric = { value: string; unit: string; label: string; basis: string }
  export type Activity = { what: string; where: string; when: string; detail?: string }
  export type Post = { title: string; href: string; date: string }
  export const PERSON: { name; title; employer; location; email; github; githubHandle; linkedin; linkedinHandle; site; blog; summary: string; about: string[]; interests: string[] }
  export const METRICS: Metric[]  // 4, per spec §5 section 1
  export const EXPERIENCE: { employer: string; place: string; roles: Role[]; bullets: Bullet[] } // roles newest first; bullets in spec §3 order
  export const PROJECTS: Project[] // enlacey(lg), healthcare, fair, safestride, flight
  export const EDUCATION: { school; campus; degree; from; to; completed; cgpa: '9.63 / 10'; sgpa: string; rank: string; rankSource: string; courses: { name: string; grade: string }[] }
  export const PUBLICATION: { title: string; authors: string[]; me: string; note: string }
  export const ACTIVITIES: Activity[]
  export const SKILLS: { label: string; items: string[] }[]
  export const POSTS: Post[]
  export const UPDATED = 'Nov 2026'
  ```
- [ ] Step 1: write the tests:
  - `PERSON.title === 'Data and Backend Engineer'`;
  - `EXPERIENCE.roles` are three, newest first; the intern role has `from '2023-06'`, `to '2023-08'`; the first full-time role starts `'2024-08'`;
  - `EDUCATION.cgpa === '9.63 / 10'`;
  - `EDUCATION.rank` contains `top 5%` and no digit run of 3+ (no cohort size);
  - every `href` starts `https://` or `mailto:`;
  - `JSON.stringify` of every export fails the banned-words regex;
  - no string contains `750`, `Ab Initio` or `TODO`;
  - `METRICS.length === 4`.
- [ ] Step 2: run the tests and expect them to FAIL.
- [ ] Step 3: write the data, verbatim from spec §3; the copy is the builder's within those facts.
- [ ] Step 4: run the tests and expect PASS.
- [ ] Step 5: commit with `feat(resume): the master record`.

### Task 3: Renderer and build plugin

**Files:**
- Create: `src/resume/render.ts`, `src/resume/head.ts`, `vite-plugin-resume.ts` (repo root)
- Modify: `vite.config.ts` (add the plugin)
- Test: `tests/resume-render.test.ts`

**Interfaces:**
- Consumes: the Task 2 exports.
- Produces:
  - `renderResume(): string`, the `<body>` markup;
  - `renderHead(): string`, which returns:
    - the `<title>`;
    - the meta description;
    - the canonical `https://naman-gururani.github.io/portfolio/`;
    - `og:*` with `og:image` `https://naman-gururani.github.io/portfolio/og.png` 1200×630;
    - `twitter:card` `summary_large_image`;
    - a JSON-LD `ProfilePage` → `Person`;
  - `resumePlugin(): Plugin`, which uses `transformIndexHtml` to replace the two markers in the résumé entry only (it skips any path containing `/play/`).
- The markup contract that later tasks style and script:
  - section ids: `#top #impact #experience #projects #play #education #publication #leadership #writing #skills #contact`;
  - the hero card `.cred` with children `.cred-foil` and `.cred-glare`;
  - the top ribbon `a.ribbon[href="/portfolio/play/"]`;
  - the ticket `a.ticket[href="/portfolio/play/"]`;
  - the nav `nav.bar a[href^="#"]`;
  - buttons `[data-copy-email]`, `[data-print]`, `[data-theme-toggle]`;
  - `<details>` for the extra bullets and the lineage "How it works";
  - `<time datetime>` on every date.
- [ ] Step 1: write the tests:
  - the rendered body contains each id, the H1 equal to `PERSON.name`, every project name, the citation title, the rank string and the CGPA;
  - it fails the banned-words regex;
  - it has exactly one `<h1>`;
  - JSON-LD `JSON.parse` succeeds, with `@type` `ProfilePage` and `mainEntity.jobTitle` equal to the title;
  - every `<a target="_blank">` has `rel="noopener"`;
  - happy-dom parses the output, and `document.querySelectorAll('section[id]').length >= 10`.
- [ ] Step 2: run the tests and expect them to FAIL.
- [ ] Step 3: implement. Escape every interpolated string (`&<>"'`).
- [ ] Step 4: run `npx vitest run && npx tsc --noEmit && npm run build`, then `grep -c 'Data and Backend Engineer' dist/index.html`. Expect at least 2.
- [ ] Step 5: commit with `feat(resume): render the page at build time from the record`.

### Task 4: The glass design (CSS and fonts)

**Files:**
- Create: `src/resume/resume.css`
- Modify: `index.html` (link it through a module entry `src/resume/main.ts` that imports the CSS and fonts)
- Modify: `package.json` (add `@fontsource/geist-sans`, `@fontsource/jetbrains-mono`; Inter is already present)
- Test: `tests/resume-css.test.ts`

The CSS follows spec §5: the scene, glass, hero credential, ribbon, ticket, nav, sections, the light skin under `:root[data-theme=light]`, print, `forced-colors` and reduced motion.

- [ ] Step 1: write the static CSS checks:
  - every `opacity:\s*0` and `animation-timeline` occurrence sits inside a `prefers-reduced-motion: no-preference` or `@supports` block;
  - an `@media print` block exists and hides `.scene, .bar, .ribbon, .ticket`;
  - `backdrop-filter` appears inside `@supports`.
- [ ] Step 2: run the checks and expect them to FAIL. Step 3: write the CSS. Step 4: run the tests, build, and review screenshots (Task 6's script) at 1440 and 390 in both skins.
- [ ] Step 5: commit with `feat(resume): the glass holo-credential design`.

### Task 5: Behaviour

**Files:**
- Create: `src/resume/main.ts`, `src/resume/tilt.ts`, `src/resume/spy.ts`, `src/resume/theme.ts`
- Test: `tests/resume-behaviour.test.ts`

**Interfaces:**
- Produces:
  - `tiltFor(x: number, y: number, rect: {left,top,width,height}, max = 10): { rx: number; ry: number; mx: number; my: number }`, with `mx`/`my` in 0–100 and `rx`/`ry` clamped to ±max;
  - `nextTheme(cur: 'dark'|'light'): 'dark'|'light'`;
  - `initialTheme(stored: string|null): 'dark'|'light'`, which defaults to `'dark'` regardless of the OS;
  - `activeSection(tops: {id: string; top: number}[], line: number): string`, the last section whose top ≤ `line`.
- [ ] Step 1: write the tests:
  - `tiltFor` at the centre is 0/0/50/50; at the corners it is clamped to ±10;
  - `initialTheme(null) === 'dark'`; `initialTheme('light') === 'light'`; `initialTheme('junk') === 'dark'`;
  - `activeSection` picks correctly;
  - copy-email writes `PERSON.email` to a mocked clipboard and sets `data-copied` on the button for 1.6 s.
- [ ] Step 2: run the tests and expect them to FAIL. Step 3: implement:
  - pointer tilt through `requestAnimationFrame`, mouse and pen only;
  - one foil sweep on touch;
  - nothing under reduced motion;
  - the section spy with IntersectionObserver plus `activeSection`, setting `aria-current`;
  - the theme toggle with a `document.startViewTransition` diagonal wipe when supported;
  - print.
- [ ] Step 4: run the tests, then `npm run build` and check that the résumé JS chunk is at most 15 KB min.
- [ ] Step 5: commit with `feat(resume): tilt, foil, section spy, skins, copy and print`.

### Task 6: Images and visual verification

**Files:**
- Create: `scratch/resume-shots.cjs` (gitignored). It drives the static preview on :4173 and writes:
  - 1440×900 and 390×844 shots in both skins;
  - a print-media shot;
  - `scrollWidth` checks at 360px.
- Create: `public/og.png` (1200×630, under 300 KB, rendered from the hero).
- Create: `public/resume/fair.webp` (the ticket's screenshot of the fair, under 60 KB).
- [ ] Step 1: run the script and expect no horizontal overflow at 360, 390 and 1440 (`scrollWidth <= innerWidth`) and zero console errors.
- [ ] Step 2: look at every shot and fix what reads badly in Tasks 4 and 5. Commit the images with `feat(resume): share image and the fair ticket`.

### Task 7: The game reads the same record

**Files:**
- Modify: `src/data/content.ts`, `tests/content.test.ts`, `tests/coaster.test.ts`, `tests/index-html.test.ts`, `play/index.html`, and any test that pins the old copy.

**Interfaces:**
- Consumes: `PERSON`, `EXPERIENCE`, `EDUCATION` from `src/data/resume.ts`.
- Produces: `PROFILE` keeps its shape, with `role` derived from `PERSON.title`.

The copy changes:
- Every "Software Development Engineer" becomes "Data and Backend Engineer".
- "~750M records a day" and "~750 million" become "hundreds of millions of records a day".
- The `stealth` zone's title and body name Enlacey and say it is live on Google Play, with iPhone coming soon. Its claw-box `short` stays `'???'` (game mechanics). Its kicker becomes `PROJECT · LIVE`. Add the Play link.
- The file's audit note about the never-named product is updated.
- [ ] Step 1: update the tests to the new copy. Run them and expect them to FAIL.
- [ ] Step 2: change `content.ts` and the `play/index.html` meta and noscript. Run `npx vitest run && npx tsc --noEmit` and expect green.
- [ ] Step 3: commit with `feat(game): read the résumé record; name Enlacey`.

### Task 8: Sibling repos (parallel, each on its own branch `v6/resume`, no push)

- **Homepage** (`C:\AntiG\naman-gururani.github.io`):
  - copy: "data engineer" → "Data and Backend Engineer";
  - the Enlacey card → live on Google Play, iPhone soon;
  - the hero buttons → "▶ PLAY THE PORTFOLIO" goes to `/portfolio/play/`, and a new "RÉSUMÉ" button goes to `/portfolio/`; the Fair card links `/portfolio/play/`;
  - `public/lineage/index.html` → `/portfolio/play/` (update its test);
  - blog polish: an author card, previous and next post links, a TOC for posts with three or more H2s, per-post OG;
  - post #1: game links → `/portfolio/play/`, plus `updatedDate` and a one-line note.
  - Gates: `npm test && npm run build`.
- **Profile** (`C:\AntiG\github-profile`):
  - `scripts/art.mjs`: the subtitle becomes `DATA &amp; BACKEND ENGINEER // PAYMENTS &amp; STREAMING`, and a fourth phrase is added, `building Enlacey, live on Google Play`;
  - fit the slot timing to four phrases;
  - regenerate the SVGs and update the README alt text.
  - Gates: `npm test`.
- **Posts** (later, drafts only, `_`-prefixed files): the Enlacey first-accept-wins post and the Hinglish search post, from `C:\AntiG\Enlacey\docs\case-study.md` §3 and §5, held to option B. They stay drafts for Naman's review.

### Task 9: Whole-branch review, then ship on Naman's go

- [ ] A fresh reviewer reads the spec, this plan and `git diff main..v6/resume`, and reports Critical and Important findings. Fix them.
- [ ] Gates: `npx vitest run`, `npx tsc --noEmit`, `npm run build`, the Task 6 shots.
- [ ] On Naman's go:
  1. Deploy the game first: `npm run build && npx gh-pages -d dist`. The old homepage button still lands on `/portfolio/`, now the résumé with its game ribbon, so nothing breaks.
  2. Then push the homepage.
  3. Then push the profile.
  4. Do a live check.
