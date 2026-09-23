# GitHub Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the small text-only profile README at `github.com/Naman-Gururani` with a Printstream-styled page: an animated banner, a generic pixel developer typing at a desk, four live stats cards drawn by the repo's own GitHub Action, the contribution snake, and a prominent link to the portfolio at its new `/portfolio/` address.

**Architecture:** Every image is generated inside this repository — no third-party image host at view time, because the public `github-readme-stats` instance is paused and renders broken cards. `scripts/cards.mjs` is a dependency-free Node script that queries the GitHub GraphQL API with the workflow's own `GITHUB_TOKEN` and writes SVG files into `assets/`; a daily workflow runs it and commits the result. The banner and desk scene are static hand-written animated SVGs, generated once by `scripts/art.mjs` so their pixel data stays reviewable.

**Tech Stack:** Node 22 (no dependencies — `fetch` and `node:test` are built in), GitHub Actions, SVG with CSS animation, `Platane/snk@v3`.

**Spec:** `C:\AntiG\lineage\docs\superpowers\specs\2026-09-14-guide-printstream-profile-design.md` (§D)

**Working directory:** `C:\AntiG\github-profile` — **run `git pull` first**; the blog-post bot commits here on its own.

## Global Constraints

- Printstream palette, same hex values as the site: ground `#141313`, surface `#201f1f`, text `#e5e2e1`, outline `#444748`, holographic `#a9e8ff → #d9bcff → #fcd6ff`. Light variants on `#f4f4f4` with `#1c1b1b` text.
- Fonts inside SVG must be web-safe stacks or drawn shapes — GitHub strips `@font-face` from SVGs served through its image proxy. Use `ui-monospace, SFMono-Regular, Menlo, monospace` and `system-ui, sans-serif`, and treat any specific font as a best-effort.
- GitHub's image proxy (camo) **strips JavaScript** from SVG but **runs CSS animation and SMIL**. Every animation must be CSS or SMIL. No `<script>`.
- Dark/light pairs are published through `<picture>` with `prefers-color-scheme`; every image also needs real `alt` text.
- The character in the desk scene is **generic** — not Naman's likeness, not the game's hero sprite.
- No résumé facts invented here: role, stack and links match `src/data/content.ts` in the game repo and the existing README.
- Never commit, push or deploy unless the user asks. Commit trailers:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` / `Claude-Session: https://claude.ai/code/session_01SVLAWGJCNP4Y3sCH8cUJPD`.
- The existing `blog-post-workflow.yml` and its `BLOG-POST-LIST` markers must keep working — the bot writes between them.

## Review Focus

1. **A GraphQL call that fails or rate-limits.** The workflow runs daily; one bad response must not commit a blank or half-written card over a good one. Expected: the script exits non-zero and writes nothing. *(Task 2 test.)*
2. **A year with no contributions in some weeks.** The heatmap and streak maths must handle empty weeks, a streak that is still running today, and a calendar that starts mid-week. *(Task 2 tests.)*
3. **Private work.** Most repos here are private, so public-only numbers will look thin. The cards must count what the token can see and never claim a total they did not measure; the user is told separately about the *Include private contributions* profile setting. *(Task 2 test that the label says what it counts.)*
4. **GitHub's proxy.** A card that renders in a browser but not on GitHub is the common failure: `<script>`, external fonts, `<foreignObject>`, and external images all get stripped. *(Task 1 and Task 3 checks.)*
5. **Light mode.** Roughly half of visitors read GitHub in light mode; a dark-only SVG shows as an unreadable dark slab. Every image ships a light twin. *(Task 5 check.)*

---

### Task 1: The banner and the desk scene

**Files:**
- Create: `scripts/art.mjs`, `assets/banner-dark.svg`, `assets/banner-light.svg`, `assets/desk-dark.svg`, `assets/desk-light.svg`
- Create: `tests/art.test.mjs`

**Interfaces:**
- Produces: `node scripts/art.mjs` writes the four SVGs; the README references them by path.

- [ ] **Step 1: Write the failing test**

```js
// tests/art.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const files = ['assets/banner-dark.svg', 'assets/banner-light.svg', 'assets/desk-dark.svg', 'assets/desk-light.svg']

test('every SVG survives GitHub\'s proxy', () => {
  for (const f of files) {
    const svg = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
    assert.doesNotMatch(svg, /<script/i, `${f} has a script tag — camo strips it`)
    assert.doesNotMatch(svg, /foreignObject/i, `${f} uses foreignObject`)
    assert.doesNotMatch(svg, /href="https?:/i, `${f} pulls an external resource`)
    assert.match(svg, /@keyframes|<animate/i, `${f} should animate`)
    assert.match(svg, /prefers-reduced-motion/, `${f} must respect reduced motion`)
  }
})

test('the desk scene is not a portrait of anybody', () => {
  const svg = readFileSync(new URL('../assets/desk-dark.svg', import.meta.url), 'utf8')
  assert.doesNotMatch(svg, /naman/i)
})
```

- [ ] **Step 2: Run it and watch it fail**

`node --test tests/` → FAIL, files missing.

- [ ] **Step 3: Write the generator**

`scripts/art.mjs` builds both scenes from a small pixel grid so the art is data, not hand-typed rectangles. Structure:

```js
// scripts/art.mjs — writes the profile's animated SVGs.
//
// Pixels are described as rows of palette keys, one character per pixel, so a
// change is a change to a picture rather than to three hundred <rect> tags.
// Everything animates in CSS: GitHub's image proxy runs CSS and SMIL but
// strips <script>, and it will not fetch a font or an image for us.
import { writeFileSync, mkdirSync } from 'node:fs'

const PAL_DARK = { '.': null, k: '#141313', s: '#201f1f', o: '#444748', t: '#e5e2e1', h: '#d9bcff', c: '#a9e8ff', p: '#fcd6ff', w: '#ffffff' }

/**
 * Two typing poses on a 96×64 grid, one string per row, one character per
 * pixel. Draw them so the scene reads at a glance: desk slab across the
 * bottom third, monitor standing left of centre with a lit screen, the figure
 * seen from behind and slightly right — hood up, headphone band, no face at
 * all — forearms reaching the desk. Frame B differs from frame A only in the
 * forearm/hand rows, so the hands tap and nothing else moves.
 */
const DESK_A = [ /* 64 strings of 96 characters, keys from PAL_DARK */ ]
const DESK_B = [ /* the same rows; only the two forearm rows differ */ ]

/**
 * Pixels → SVG. Adjacent pixels of the same colour on a row become one <rect>,
 * which turns ~6k pixels into a few hundred rects and keeps the file small
 * enough for a README to load fast.
 */
function rects(rows, pal, scale) {
  const out = []
  rows.forEach((row, y) => {
    let runStart = 0
    for (let x = 1; x <= row.length; x++) {
      if (x < row.length && row[x] === row[runStart]) continue
      const key = row[runStart]
      const colour = pal[key]
      if (colour) out.push(`<rect x="${runStart * scale}" y="${y * scale}" width="${(x - runStart) * scale}" height="${scale}" fill="${colour}"/>`)
      runStart = x
    }
  })
  return out.join('')
}

function deskSVG(pal) {
  // Two <g> layers, one per typing frame, alternated by a `steps(1)` opacity
  // animation (0.42s) so the hands snap rather than smear. Two more
  // animations: the monitor's code lines translate upward on a 6s loop behind
  // a clip path, and three steam ellipses drift up from the mug with fading
  // opacity. shape-rendering="crispEdges" on the root, viewBox 0 0 480 320.
}

function bannerSVG(pal) {
  // viewBox 0 0 840 220. Name at 44px in a system stack, the mono kicker
  // under it at 14px/0.05em, a 2px holographic hairline whose gradient
  // drifts (animate the x1/x2 of a linearGradient), and a typing line: three
  // <tspan> phrases, each revealed by animating the width of a clipPath rect,
  // with a caret rect blinking on a 1s steps(2) cycle.
}
```

The phrases for the typing line, in order: `payments that must not lose a record`, `streams that must not stop`, `a portfolio you can walk around`.

Each file ends with:

```css
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
```

- [ ] **Step 4: Generate and look at them**

```bash
node scripts/art.mjs
node --test tests/
```
Open each SVG in a browser at 100 % and at 2× — the pixel art must stay crisp (`shape-rendering="crispEdges"`), the caret must blink, the hands must alternate, and the light twin must be legible on white.

- [ ] **Step 5: Commit**

```bash
git add scripts/art.mjs assets/*.svg tests/art.test.mjs
git commit -m "feat(profile): animated banner and a pixel desk scene"
```

---

### Task 2: The stats card generator

**Files:**
- Create: `scripts/cards.mjs`, `scripts/github.mjs` (the API layer), `tests/cards.test.mjs`, `tests/fixtures/graphql.json`
- Modify: `package.json` (add `"scripts": { "test": "node --test tests/", "cards": "node scripts/cards.mjs" }`, `"type": "module"`)

**Interfaces:**
- Consumes: `process.env.GITHUB_TOKEN`, `process.env.GITHUB_LOGIN` (defaults `Naman-Gururani`).
- Produces: `assets/card-overview-{dark,light}.svg`, `card-streak-*`, `card-langs-*`, `card-heatmap-*`; exported pure functions `streaks(days)`, `langShares(repos)`, `cardSVG(spec, pal)`.

- [ ] **Step 1: Write the failing test**

```js
// tests/cards.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { streaks, langShares, cardSVG } from '../scripts/cards.mjs'

const day = (date, count) => ({ date, contributionCount: count })

test('streaks count the run up to today', () => {
  const days = [day('2026-09-20', 1), day('2026-09-21', 0), day('2026-09-22', 4), day('2026-09-23', 2)]
  const s = streaks(days, '2026-09-23')
  assert.equal(s.current, 2)
  assert.equal(s.longest, 2)
  assert.equal(s.total, 7)
})

test('a gap today does not zero a streak that ended yesterday', () => {
  const days = [day('2026-09-21', 3), day('2026-09-22', 3), day('2026-09-23', 0)]
  const s = streaks(days, '2026-09-23')
  assert.equal(s.current, 2, 'today has not happened yet; yesterday still counts')
})

test('empty weeks are survivable', () => {
  const s = streaks([], '2026-09-23')
  assert.deepEqual([s.current, s.longest, s.total], [0, 0, 0])
})

test('language shares ignore forks and sum to 100', () => {
  const repos = [
    { isFork: false, languages: [{ name: 'TypeScript', size: 600 }, { name: 'CSS', size: 400 }] },
    { isFork: true, languages: [{ name: 'C++', size: 9999 }] },
  ]
  const out = langShares(repos)
  assert.equal(out[0].name, 'TypeScript')
  assert.equal(Math.round(out.reduce((a, l) => a + l.pct, 0)), 100)
})

test('a card says what it counted', () => {
  const svg = cardSVG({ title: 'OVERVIEW', rows: [['Repos', '12']] }, 'dark')
  assert.match(svg, /OVERVIEW/)
  assert.doesNotMatch(svg, /<script/i)
})
```

- [ ] **Step 2: Run it and watch it fail**

`npm test` → FAIL, module missing.

- [ ] **Step 3: Write the API layer**

```js
// scripts/github.mjs
const API = 'https://api.github.com/graphql'

export async function gql(query, variables, token) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'naman-profile-cards' },
    body: JSON.stringify({ query, variables }),
  })
  if (!r.ok) throw new Error(`GitHub API ${r.status} ${r.statusText}`)
  const body = await r.json()
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '))
  return body.data
}

export const PROFILE_QUERY = `query($login:String!){
  user(login:$login){
    contributionsCollection{
      totalCommitContributions
      restrictedContributionsCount
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount } } }
    }
    repositories(first:100, ownerAffiliations:OWNER, orderBy:{field:PUSHED_AT, direction:DESC}){
      totalCount
      nodes{ name isFork stargazerCount languages(first:10, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name } } } }
    }
    followers{ totalCount }
  }
}`
```

- [ ] **Step 4: Write the card renderer and the maths**

`scripts/cards.mjs` exports `streaks`, `langShares`, `cardSVG` (all pure, all tested) and, when run as a script, fetches, renders and writes the eight files. Rules the tests pin:

- `streaks(days, today)` walks the calendar backwards; a zero on `today` does not break a streak (the day is not over), a zero before that does.
- `langShares(repos)` drops forks, sums bytes by language, returns `{ name, pct }` sorted desc, percentages rounded so they total 100. It takes a **normalized** shape — `{ isFork, languages: [{ name, size }] }` — so the GraphQL `languages.edges[{ size, node { name } }]` is flattened by the fetch layer before it is called, and the pure function stays testable without an API shape in the test.
- Every card is `<svg width="420" height="200">` with a 1 px `--outline` frame, a mono title, a serial in the corner and the Printstream palette; the heatmap card is 840 wide.
- **Failure is atomic:** fetch everything first, render into memory, and only then write the files. Any throw exits `process.exitCode = 1` before a single `writeFileSync`.
- The overview card's contributions row is labelled *contributions (last year)* and, when `restrictedContributionsCount > 0`, adds *incl. private* — never an unmeasured total.

- [ ] **Step 5: Run the tests, then a live render**

```bash
npm test
GITHUB_TOKEN=<a token with public read> node scripts/cards.mjs
```
(For the local render, take the token from `git credential fill` for github.com; never write it to a file. If no token is available, run against `tests/fixtures/graphql.json` with `CARDS_FIXTURE=1` — implement that flag.)

- [ ] **Step 6: Commit**

```bash
git add scripts/cards.mjs scripts/github.mjs tests/cards.test.mjs tests/fixtures/graphql.json package.json assets/card-*.svg
git commit -m "feat(profile): draw our own stats cards from the GraphQL API"
```

---

### Task 3: The README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rebuild the page**

Order, top to bottom: banner `<picture>`; one-paragraph intro (the existing two sentences, kept); a row of link badges (Site · Blog · LinkedIn `in/naman-gururani` · Email) as chamfered mono chips generated by `scripts/art.mjs`; a full-width **▶ PLAY MY PORTFOLIO** button image linking `https://naman-gururani.github.io/portfolio/`; the desk scene beside the "Now" list in a two-column HTML table (GitHub renders tables, not flexbox); the four stats cards two-up; the snake; "What I work with" chips; and the untouched `BLOG-POST-LIST` block.

- [ ] **Step 2: Keep the bot's markers intact**

The `<!-- BLOG-POST-LIST:START -->` / `:END` pair must survive verbatim, with the existing post line between them.

- [ ] **Step 3: Check every link**

Run a link check over the README (`node scripts/links.mjs`, ~20 lines using `fetch` with `method: 'HEAD'`): every URL returns < 400, except `/portfolio/` which 404s until the rename — assert that one is *expected* to fail and print it as pending rather than failing the run.

- [ ] **Step 4: Commit**

```bash
git add README.md scripts/links.mjs
git commit -m "feat(profile): a README worth landing on"
```

---

### Task 4: The workflows

**Files:**
- Create: `.github/workflows/cards.yml`, `.github/workflows/snake.yml`
- Keep: `.github/workflows/blog-post-workflow.yml` unchanged

- [ ] **Step 1: The cards workflow**

```yaml
name: Stats cards
on:
  schedule:
    - cron: '17 4 * * *'
  workflow_dispatch:
permissions:
  contents: write
jobs:
  cards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
      - run: node scripts/cards.mjs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_LOGIN: Naman-Gururani
      - name: Commit if anything changed
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email 'github-actions[bot]@users.noreply.github.com'
          git add assets
          git diff --staged --quiet || git commit -m 'chore: refresh stats cards'
          git push
```

- [ ] **Step 2: The snake workflow**

`Platane/snk@v3` with `github_user_name: Naman-Gururani`, two outputs (`dist/snake-dark.svg?palette=github-dark`, `dist/snake-light.svg`), recoloured via `color_snake`/`color_dots` to the Printstream ramp, pushed to the `output` branch with `crazy-max/ghaction-github-pages@v4`. The README references the raw `output` branch URLs.

- [ ] **Step 3: Validate the YAML**

Run: `node -e "require('node:fs').readdirSync('.github/workflows').forEach(f=>console.log(f))"` and check each file parses in an editor with a YAML linter; confirm `permissions: contents: write` is present in both.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/cards.yml .github/workflows/snake.yml
git commit -m "ci: daily stats cards and the contribution snake"
```

---

### Task 5: Verification

- [ ] **Step 1:** `npm test` green (art, cards, redirect-free).
- [ ] **Step 2:** Render the README locally (`npx markdown-preview` or paste into a GitHub gist preview) at desktop width and at 420 px; both skins of every image legible.
- [ ] **Step 3:** Confirm no image is loaded from a third-party host, and every `<picture>` has a dark and a light source plus alt text.
- [ ] **Step 4:** List, for the hand-back: the workflows that must be run once after the push (`Stats cards`, `Snake`, `Latest blog posts`) and the *Include private contributions on my profile* setting.
