# Printstream Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `naman-gururani.github.io` — homepage, blog index, blog post, 404 — in the Printstream look (matte black / pearl white, holographic accents, chamfered technical edges), point every link at `/portfolio/`, and leave a redirect behind at `/lineage/`.

**Architecture:** The Astro site keeps its structure — one `Base.astro` layout, four pages, one global stylesheet. The work is a token swap plus a component-level restyle: `global.css` is rewritten around the Monochrome Pearlescence tokens, `Base.astro` swaps fonts and the theme toggle's vocabulary (day/night → white/black skin), and each page's markup gains the technical furniture (serials, decals, chamfers). One new static file, `public/lineage/index.html`, is the redirect.

**Tech Stack:** Astro 7, plain CSS with custom properties, `@fontsource` (Geist, Inter, JetBrains Mono), GitHub Actions → GitHub Pages.

**Spec:** `C:\AntiG\lineage\docs\superpowers\specs\2026-09-14-guide-printstream-profile-design.md` (§C, §B1)

**Working directory:** `C:\AntiG\naman-gururani.github.io`

## Global Constraints

- Tokens come from `C:\AntiG\DESIGN.md` (Monochrome Pearlescence) — copy the hex values, do not invent near-misses. Surface `#141313`, surface-container `#201f1f`, on-surface `#e5e2e1`, outline `#8e9192`, outline-variant `#444748`, tertiary-container `#fcd6ff`, tertiary-fixed-dim `#f3aeff`, primary `#ffffff`, on-primary `#2f3131`.
- Type scale from the same file: headline-lg 40/48 `-0.02em` (mobile 32/38), headline-md 24/32, body-lg 18/28, body-md 16/24, label-md 14/20 `+0.05em`, label-sm 12/16. Geist for headings, Inter for body, JetBrains Mono for labels.
- **Two skins, both first-class.** Black is the default. The existing localStorage key `theme` and its no-flash inline script keep working; the stored values change from `day`/`night` to `white`/`black`, and the script must migrate an old value rather than break (`day` → `white`, `night` → `black`).
- Holographic accent is for interactive states only: hover, focus, active nav, the hero sheen. Never for body text.
- `prefers-reduced-motion: reduce` freezes every animation, including the sheen.
- No horizontal scroll at 390 px. Body text meets WCAG AA in both skins.
- Never commit, push or deploy unless the user asks. Commit trailers:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` / `Claude-Session: https://claude.ai/code/session_01SVLAWGJCNP4Y3sCH8cUJPD`.
- Astro's dev server is started in background mode per the repo's `CLAUDE.md` (`astro dev --background`); verification uses `npm run build` plus `npm run preview`.

## Review Focus

1. **The stored theme from the old site.** A returning visitor has `theme=night` in localStorage. Expected: they land in the black skin, not in an unstyled or default-light page. *(Task 2 test.)*
2. **The redirect's query string.** `/lineage/?fresh=1&cheat=1` must arrive at `/portfolio/?fresh=1&cheat=1` — the debug flags and the hash are part of the link people share. *(Task 5 test.)*
3. **Reduced motion.** The hero sheen animates a gradient; under reduced motion it must be a static gradient, still legible, not a blank heading. *(Task 3 check.)*
4. **Chamfered buttons and focus.** `clip-path` cuts the corner off a focus ring; every interactive element still needs a visible focus indicator that survives the clip. *(Task 3 test.)*
5. **Long post titles and code blocks.** A blog post with a long title and a wide code block must not push the page sideways at 390 px. *(Task 4 check.)*

---

### Task 1: Fonts and tokens

**Files:**
- Modify: `package.json` (swap `@fontsource/press-start-2p`, `@fontsource/pixelify-sans`, `@fontsource/fredoka` for `@fontsource/geist-sans` and `@fontsource/jetbrains-mono`; keep `@fontsource/inter`)
- Modify: `src/layouts/Base.astro` (the import block, lines 2–9)
- Modify: `src/styles/global.css` (the `:root` block, lines 1–60)

- [ ] **Step 1: Install the fonts**

```bash
npm rm @fontsource/press-start-2p @fontsource/pixelify-sans @fontsource/fredoka
npm i @fontsource/geist-sans @fontsource/jetbrains-mono
```

- [ ] **Step 2: Swap the imports in `Base.astro`**

```astro
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/jetbrains-mono/500.css';
import '../styles/global.css';
```

- [ ] **Step 3: Rewrite the token block**

```css
/* ============================================================
   NAMAN GURURANI — Printstream
   Monochrome Pearlescence: matte black and stark white, with a
   holographic accent reserved for interactive states. Two skins,
   both deliberate — black is the default, white is the flip.
   Tokens copied from DESIGN.md; do not eyeball new ones.
   ============================================================ */
:root,
:root[data-theme='black'] {
  --bg: #141313;
  --bg-2: #0e0e0e;
  --surface: #201f1f;
  --surface-hi: #2a2a2a;
  --text: #e5e2e1;
  --heading: #ffffff;
  --muted: #c4c7c8;
  --outline: #444748;
  --outline-strong: #8e9192;
  --invert-bg: #e5e2e1;
  --invert-text: #1c1b1b;
  --holo-1: #a9e8ff;
  --holo-2: #d9bcff;
  --holo-3: #fcd6ff;
  --holo: linear-gradient(90deg, var(--holo-1), var(--holo-2), var(--holo-3), var(--holo-1));
  --font-head: 'Geist Sans', system-ui, sans-serif;
  --font-body: Inter, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --chamfer: 10px;
}

:root[data-theme='white'] {
  --bg: #f4f4f4;
  --bg-2: #ffffff;
  --surface: #ffffff;
  --surface-hi: #e2e2e2;
  --text: #1c1b1b;
  --heading: #121212;
  --muted: #454747;
  --outline: #c4c7c8;
  --outline-strong: #636565;
  --invert-bg: #141313;
  --invert-text: #e5e2e1;
  --holo-1: #2aa7d0;
  --holo-2: #7d4bd0;
  --holo-3: #b23fc4;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme='black']):not([data-theme='white']) {
    /* Same overrides as [data-theme='white'] — copy the block, do not @extend. */
  }
}
```

- [ ] **Step 4: Build and eyeball**

```bash
npm run build && npm run preview
```
Expected: the site builds; pages are dark and unstyled-but-readable (the component styles come next).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/layouts/Base.astro src/styles/global.css
git commit -m "feat(style): Printstream tokens and technical type"
```

---

### Task 2: The skin toggle

**Files:**
- Modify: `src/layouts/Base.astro` (the no-flash script, lines ~37–43; the toggle button; the toggle script at the foot)
- Create: `tests/theme.test.mjs` (a plain Node test — this repo has no test runner; add `"test": "node --test tests/"` to `package.json`)

- [ ] **Step 1: Write the failing test**

```js
// tests/theme.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const base = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8')

test('the old day/night values still resolve', () => {
  assert.match(base, /day'?\s*\)?\s*\?\s*'white'/, 'day must migrate to white')
  assert.match(base, /night'?\s*\)?\s*\?\s*'black'|night'\s*:\s*'black'/, 'night must migrate to black')
})

test('the toggle names the skin, not the time of day', () => {
  assert.match(base, /aria-label="Toggle black\/white skin"/)
})
```

- [ ] **Step 2: Run it and watch it fail**

`npm test` → FAIL.

- [ ] **Step 3: Migrate the stored value**

```astro
    <script is:inline>
      // Set before first paint to avoid a flash. The old site stored
      // day/night; those values still arrive from returning visitors, so they
      // are migrated in place rather than ignored.
      try {
        const raw = localStorage.getItem('theme');
        const t = raw === 'day' ? 'white' : raw === 'night' ? 'black' : raw;
        if (t === 'white' || t === 'black') {
          document.documentElement.dataset.theme = t;
          if (t !== raw) localStorage.setItem('theme', t);
        }
      } catch {}
    </script>
```

The button becomes `aria-label="Toggle black/white skin"` with `◧` as its glyph, and the foot script's `effective()` returns `white`/`black` from `prefers-color-scheme: light`.

- [ ] **Step 4: Run the test and watch it pass, then commit**

```bash
npm test && npm run build
git add src/layouts/Base.astro package.json tests/theme.test.mjs
git commit -m "feat(style): black/white skin toggle, migrating the old theme value"
```

---

### Task 3: The shell and the homepage

**Files:**
- Modify: `src/styles/global.css` (everything below the tokens — header, footer, buttons, cards, lists)
- Modify: `src/layouts/Base.astro` (header/footer markup), `src/pages/index.astro`

- [ ] **Step 1: Header, footer, links**

Wordmark `NAMAN GURURANI` in `--font-mono`, uppercase, `+0.05em`, with a 1 px `--outline` hairline under the bar. Nav links in mono label-md; hover and `aria-current` draw a 2 px holographic underline (`background-image: var(--holo)` on a `::after`). Footer: same hairline above, mono label-sm, "Built with Astro".

- [ ] **Step 2: The primitives**

```css
/* Primary: stark white block, black text, one corner machined off. */
.btn.primary {
  background: var(--invert-bg);
  color: var(--invert-text);
  border: 0;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--chamfer)), calc(100% - var(--chamfer)) 100%, 0 100%);
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.4rem;
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid var(--outline-strong);
  color: var(--text);
  background: transparent;
}
/* The clip cuts a focus ring off, so focus is drawn inside the shape. */
.btn:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--holo-2);
}
.card {
  position: relative;
  border: 1px solid var(--outline);
  background: var(--surface);
  padding: 1.5rem;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
}
.card .serial {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}
```

- [ ] **Step 3: The hero**

Kicker `DATA ENGINEER // PAYMENTS & STREAMING` in mono. `h1` in Geist 700, `clamp(2.4rem, 8vw, 5.5rem)`, `-0.02em`, with the sheen:

```css
.hero h1 .accent {
  background: var(--holo);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: sheen 9s linear infinite;
}
@keyframes sheen { to { background-position: 300% 0; } }
@media (prefers-reduced-motion: reduce) {
  .hero h1 .accent { animation: none; background-position: 40% 0; }
}
```

- [ ] **Step 4: The four doors become technical cards**

Keep the existing copy and hrefs, restyle as `.card` with serials `PS-001`…`PS-004`, the glyph dropped or replaced by a mono label, and the portfolio card's href changed to `/portfolio/`. The posts list gets hairline separators and a holographic `›` on hover.

- [ ] **Step 5: Verify**

```bash
npm run build && npm run preview
```
Screenshot 1440 / 768 / 390 in both skins with `scratch/shots.mjs` (Playwright from the npx cache, same path as the game repo uses). Check: no horizontal scroll at 390, AA contrast, focus visible on every control, sheen frozen under reduced motion.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/Base.astro src/pages/index.astro
git commit -m "feat(home): Printstream hero, cards and shell"
```

---

### Task 4: Blog index, post and 404

**Files:**
- Modify: `src/pages/blog/index.astro`, `src/pages/blog/[...id].astro`, `src/pages/404.astro`, `src/styles/global.css` (prose block)

- [ ] **Step 1: Prose**

Body 18/28 Inter at `max-width: 68ch`; `h2`/`h3` Geist with a mono kicker rule above; `blockquote` with a 2 px left rule in `--outline-strong`; `code` and `pre` in JetBrains Mono on `--surface`, `pre { overflow-x: auto }` so a wide block scrolls itself instead of the page; tables the same.

- [ ] **Step 2: Post header**

Date and reading time as mono labels, title in Geist `clamp(2rem, 5vw, 3rem)` with `overflow-wrap: anywhere` so a long title wraps rather than widening the page.

- [ ] **Step 3: 404**

Keep it short: a mono `ERR // 404`, one line, two buttons (home, portfolio).

- [ ] **Step 4: Verify and commit**

Screenshot the post at 390 and 1440 in both skins; confirm no sideways scroll.

```bash
git add src/pages src/styles/global.css
git commit -m "feat(blog): Printstream prose and post furniture"
```

---

### Task 5: `/portfolio` links and the `/lineage` redirect

**Files:**
- Create: `public/lineage/index.html`
- Create: `tests/redirect.test.mjs`
- Modify: every `/lineage/` href (`src/layouts/Base.astro` nav + footer, `src/pages/index.astro` hero button and card)

- [ ] **Step 1: Write the failing test**

```js
// tests/redirect.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const html = readFileSync(new URL('../public/lineage/index.html', import.meta.url), 'utf8')

/** Every .astro file under src — `fs.globSync` is too new to rely on here. */
function astroFiles(dir = 'src', out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) astroFiles(p, out)
    else if (e.name.endsWith('.astro')) out.push(p)
  }
  return out
}

test('the redirect keeps the query and the hash', () => {
  assert.match(html, /location\.search/)
  assert.match(html, /location\.hash/)
  assert.match(html, /\/portfolio\//)
})

test('no page still links to /lineage/', () => {
  for (const f of astroFiles()) {
    assert.doesNotMatch(readFileSync(f, 'utf8'), /href="\/lineage\//, `${f} still points at /lineage/`)
  }
})
```

- [ ] **Step 2: Run it and watch it fail**

`npm test` → FAIL (file missing, and the layout still links `/lineage/`).

- [ ] **Step 3: Write the redirect**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Moved to /portfolio/</title>
    <link rel="canonical" href="https://naman-gururani.github.io/portfolio/" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=/portfolio/" />
    <script>
      // Keep the query and the hash: ?fresh=1&cheat=1 and #anchors are part of
      // the links people have already shared.
      location.replace('/portfolio/' + location.search + location.hash);
    </script>
  </head>
  <body>
    <p>The portfolio moved to <a href="/portfolio/">/portfolio/</a>.</p>
  </body>
</html>
```

- [ ] **Step 4: Swap the links, run the test, commit**

```bash
npm test && npm run build
git add public/lineage/index.html tests/redirect.test.mjs src/layouts/Base.astro src/pages/index.astro
git commit -m "feat: point the site at /portfolio and leave a redirect behind"
```

---

### Task 6: Whole-site verification

- [ ] **Step 1:** `npm test && npm run build` — green, and `dist/lineage/index.html` exists.
- [ ] **Step 2:** `npm run preview` and walk every route: `/`, `/blog/`, the post, `/lineage/` (redirects locally to `/portfolio/`, which 404s until the game is deployed — expected), `/404`.
- [ ] **Step 3:** Screenshots at 1440 / 768 / 390 in both skins, saved to `scratch/shots/site-*.png`, listed in the report.
- [ ] **Step 4:** Confirm the RSS feed still builds and the blog-post workflow's feed URL (`/rss.xml`) is unchanged.
