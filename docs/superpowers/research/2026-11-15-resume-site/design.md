# Design research: a striking but scannable engineer résumé page (/portfolio/)

Date: 2026-11-15. Researcher notes. Items marked **[J]** are my judgement, not sourced fact.

## 0. Method and limits

- Read `C:\AntiG\DESIGN.md` (Monochrome Pearlescence) and the live homepage https://naman-gururani.github.io/ (HTML + `/_astro/Base.NpWxv3Na.css` pulled with curl, screenshot with Playwright).
- 15 reference sites: fetched with curl, WebFetch, and loaded in Playwright Chromium (desktop 1280×800, no throttling). I measured bytes transferred at load + 2.5 s, request count, LCP element, CLS, `<canvas>` count, and whether any same-origin stylesheet has a `prefers-reduced-motion` rule.
  - Byte figures are **lower bounds**: cross-origin resources without `Timing-Allow-Origin` report 0. LCP times are from a desktop, unthrottled run, so they are not field data. Compare them with each other, not with CWV thresholds.
  - Screenshots taken: Brittany Chiang (desktop + 390 px), Rauno, Chánh Đại, Anthony Fu, homepage. Saved in `scratchpad/research/shots/`.
- WebFetch could not reach awwwards.com or lynnandtonic.com (ECONNREFUSED / DNS), so I fetched those with curl. HN "Show HN" search results came only from mirror pages and were not useful for ranking. HN reception claims below are my recollection, marked [J].

## 1. How Printstream is already applied on the homepage (the baseline to match)

- Tokens: `:root[data-theme=black|white]` plus a `prefers-color-scheme` fallback. A pre-paint inline script reads `localStorage.theme`, so there is no skin flash. The toggle glyph is ◧/◨.
- Holo: `--holo: linear-gradient(90deg, #a9e8ff, #d9bcff, #fcd6ff, …)` in black. The white skin uses darker stops (`#248fb2 #7d4bd0 #b23fc4`). Holo is used for:
  - a 6 px square before every `.label`;
  - a 2 px top-border wipe on `.btn` and `.card` hover (`scaleX` 0 → 1);
  - the nav underline;
  - one word of the H1 ("WORLD") with a 9 s `background-position` sheen, switched off under reduced-motion and `prefers-contrast: more`;
  - the focus ring (`outline: 2px solid var(--holo-2)`).
- Shape: chamfer via `clip-path: polygon(…)` on the bottom-right corner (7/10/14 px). Serial labels (`PS-001`) sit top-right in mono 12 px, with a ✕ decal bottom-right.
- Background: 44 px dot grid, a radial-gradient on `body`.
- Fonts: Geist Sans 400/600/700 and Inter 400/500, both self-hosted woff2 with `font-display: swap`. Inter is split by unicode-range, so only Latin downloads. JetBrains Mono 500 is **inlined as a tiny base64 subset**. That is clever, but check that the subset covers every glyph the résumé will use (lowercase, `→`, `·`, digits).
- Measured: 129 KB, 7 requests, 0 external JS, CLS 0.001, LCP = H1.
- Craft nits seen [J]:
  1. `clip-path` chamfers cut the 1 px border, so the diagonal edge has no stroke (visible in `home-corner.png`). Fix: draw the stroke with a pseudo-element clipped to the same polygon, or stack two clipped layers (outer = border colour, inner inset 1 px).
  2. The theme button renders without JS but does nothing. Inject it from JS, or hide it under `.no-js`.
  3. The homepage card calls Enlacey "launching soon". If it is live now, the copy is stale.

## 2. Reference sites (2023–2026, all checked live 2026-11-15)

| # | Site | Signature move(s) | 1-minute scannability | Perf / motion (measured lower bounds) |
|---|---|---|---|---|
| 1 | Brittany Chiang, https://brittanychiang.com | Two columns. The left column is sticky (name, role, tagline, scrollspy nav whose line grows 32→64 px on the active section, social icons). The right column scrolls. A cursor-following radial spotlight (`radial-gradient(600px at x y, rgba(29,78,216,.15), transparent 80%)`). Hovering an experience row dims its siblings to 50 %. | Best in class: name, role and tagline above the fold; employer in the About text; experience rows read "date · Title · Company + tags". Same-company roles are grouped (Upstatement: Lead → Senior → Engineer). Date ranges carry `aria-label="2024 to Present"`. Skip link. "View Full Résumé" PDF link. On mobile the section labels become sticky headers. | 1.3 MB (1.16 MB fonts!), 150 KB JS, Next.js + Tailwind, has a reduced-motion rule, CLS 0. |
| 2 | Lee Robinson, https://leerob.com | Radical minimalism: one paragraph ("I work on ML at SpaceX (formerly at Cursor…)") over a painted SVG cloud backdrop, then Notes/Blogs lists. | Role and employer in sentence one. No timeline. | 553 KB, 235 KB JS, CLS 0. |
| 3 | Rauno Freiberg, https://rauno.me | Huge indented kinetic headline ("Rauno Freiberg / is an Estonian / interaction designer…"). A horizontal deck of cards with a ruler-tick position indicator. A yellow disc follows a crosshair cursor. "Copied" email. | Role and employer are in the headline itself; everything else is a click away. | 1.0 MB, 957 KB JS; no CSS reduced-motion rule found (it may be in JS). |
| 4 | Paco Coursey, https://paco.me | Typographic restraint; creator of ⌘K (cmdk) and next-themes. Sections: Building / Projects / Writing / Now / Connect. | "Webmaster at Linear" in line one. | 373 KB, 209 KB JS. My LCP observer recorded no entry, possibly because of fade-in entrances [J]. |
| 5 | Emil Kowalski, https://emilkowal.ski | Minimal list site; the craft lives in the linked components (Sonner, Vaul) and the course banner. | "Design Engineer", prior employers Linear/Vercel. | 863 KB (587 KB fonts), 184 KB JS. |
| 6 | Josh W. Comeau, https://www.joshwcomeau.com | Whimsy: sound-effects toggle, springy interactions, sparkles, theme-matched portrait. | It's a blog/course hub, not a résumé; no role or employer on the home page. | 923 KB, 295 KB JS, has a reduced-motion rule. |
| 7 | Anthony Fu, https://antfu.me | Generative "plum branch" canvas art in the margins, a handwritten SVG signature, staggered `slide-enter` entrance. The key move is rows of logo chips: "Working at / Creator of / Recent work / Core team of / Maintaining". | Excellent: those chip rows are a five-second CV. | 237 KB, 99 KB JS, has a reduced-motion rule. |
| 8 | Bruno Simon, https://bruno-simon.com (folio-2025) | A drivable 3D island: Three.js WebGPU/TSL, Rapier physics, shared weather, "Whispers", a lap leaderboard. Interface rebuilt in 3D, gamepad support. | Poor for a minute: no HTML UI by design. His own case study admits users expect instant access to information. | ≥1.35 MB at load (preloads GLB/KTX), 964 KB JS, fonts `display=block`. |
| 9 | Henry Heffernan, https://henryheffernan.com | A 3D room whose monitor runs an OS-style portfolio. Widely shared in 2022 [J]. | Poor: name only in the meta tags until you zoom into the screen. | 7.3 MB, LCP 4.65 s even on desktop. |
| 10 | Lynn Fisher, https://lynnandtonic.com | A full redesign every year (currently "v. XIX"), with responsive art that reshapes as the viewport changes. | Name and "Designer for the Web" are instant. | 411 KB, ~1 KB JS: the craft is all CSS. |
| 11 | Dennis Snellenberg, https://dennissnellenberg.com | The Awwwards archetype: multilingual "Hello / Bonjour / स्वागत हे…" preloader, magnetic buttons, smooth scroll. | Role visible after the preloader. | 554 KB; **CLS 0.47**; no reduced-motion rule found. |
| 12 | Chánh Đại, https://chanhdai.com | A technical-drawing aesthetic: dimension lines (768, Ø160, 32, 30°), an isometric hatched logo that follows the cursor ("click for a sound"), handwritten notes, a mono facts grid (role, city, **local time "1h ahead"**, email), a GitHub contribution graph, Ctrl K. Open-source shadcn registry (2.4k★). | Good facts grid; the page is busy. | 1.67 MB, 917 KB JS, ads. |
| 13 | Jakub Krehel, https://jakub.kr | Plain list: "Founding Design Engineer at Interfere", Projects / Writing / Links. | Instant. | 919 KB with 749 KB JS for a text page. That is the cautionary number. |
| 14 | Dustin Brett, https://dustinbrett.com (daedalOS) | A whole desktop OS in the browser. HN favourite [J]. | Poor: no `<h1>`; you have to explore. | 405 KB, 342 KB JS, 2 canvases. |

Context:
- read.cv was the standard design-forward one-page CV (years in the left column, role and company on the right). It shut down 16 May 2025 after Perplexity bought it (TechCrunch, 2025-01-17), so that layout no longer has a home. A personal page can take it over.
- The Ladders 2018 eye-tracking study puts the initial résumé screen at about 7.4 s, and found recruiters scan for titles and subheadings (HR Dive). Its rigor is disputed (ERE).
- For admissions, a personal site is a supplement. Indiana Informatics disqualifies dead links and will not download software. Faculty may look at a site when an applicant contacts them (GradCafe, anecdotal).

### Takeaways [J]
1. The sites people remember make **one** expressive move and keep the rest calm (Brittany: spotlight; Anthony Fu: plum art; Rauno: kinetic deck; Lynn: yearly reinvention).
2. The best ones put the flourish on the information itself: Anthony Fu's chip rows, Brittany's dimming rows, Chánh Đại's facts grid with live local time.
3. The game-first sites (Bruno, Henry, Dustin) win attention but fail the one-minute reader. Naman already has the game, so this page should be the fast lane, with the game as its optional encore.
4. Byte weight is not what makes these sites memorable. Lynn Fisher (~1 KB JS) is as memorable as sites shipping 900 KB of JS.

## 3. Pattern verdicts for this audience (recruiters + admissions, ~60 s, mid-range Android)

| Pattern | Verdict | Why / how |
|---|---|---|
| Kinetic type hero | **Sparingly** | A one-shot entrance of 400–600 ms at most. The text exists at frame 0 (never start the LCP element at `opacity:0`). The existing one-word holo sheen is the right dose. Typing-effect names are a gimmick: they delay the one thing people came to read. |
| "Live" data in hero | **Only if real; otherwise skip** | A bank engineer should never show anything that looks like real payment data [J]. Synthetic stream glyphs must be `aria-hidden` and labelled illustrative. Real public data that is fine: the blog's latest post, the GitHub last-push date, Enlacey status, local time in India. |
| Terminal / diff motifs | **As garnish** | Mono `git log`-style captions ("2024-08 · promoted: intern → SDE") are on-brand and scannable. A fake terminal you must type into is a gimmick: it hides content and hurts accessibility and SEO. |
| Career timeline showing a promotion | **Use** | One company rail with stacked title nodes (Brittany's Upstatement grouping). It shows progression at a glance. Mark up as `<ol reversed>` + `<time datetime>`. |
| Impact-numbers strip | **Use (3–4)** | ~750M records/day · 8 h delay → real-time · CGPA 9.63/10 · marketplace shipped. Each number needs a unit and a noun. If it counts up, it does so once, with the final value in the HTML (screen readers, print, no-JS). No vanity stats. |
| Bento grid | **Mostly skip** | It flattens hierarchy, and by 2025 it was ubiquitous enough to be mocked. Fine for 3–4 equal-weight project tiles only. |
| Expandable case-study cards | **Use** | `<details>/<summary>` gives no-JS, keyboard, find-in-page and SEO support for free. Animate with a same-document view transition. Print must force them open (`beforeprint` → `open`). |
| Sticky section nav / scrollspy | **Use** | Desktop: a sticky left rail (Brittany). Mobile: a sticky one-row chip bar. Use IntersectionObserver + `aria-current`. Set `scroll-padding-top` so the sticky bar never hides a focused element (WCAG 2.4.11). |
| Command palette | **Skip** | Recruiters don't press ⌘K. It earns its place on docs-heavy sites (Paco, Chánh Đại), not a one-pager. |
| Hover / press micro-interactions | **Use** | Keep the holo top-wipe. Add a 1 px `:active` press, a "Copied" state on the email button (Rauno), and a chevron nudge on rows. Every hover cue needs a focus and touch equivalent. |
| Scroll-driven CSS (`animation-timeline: view()`) | **Use for one thing** | Baseline "newly available" since Oct 2026 (MDN), so older Safari and Firefox will see the static version. Wrap in `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`. Animate only transform, opacity or clip-path. Never hide content outside the `@supports` block. Best use: a holo rail filling down the timeline. |
| View transitions | **Use, same-document** | Baseline since Oct 2025 (Firefox 144). Good for the skin toggle (a 45° diagonal "chamfer wipe") and card expand. Cross-document VT works in Chrome 126+ and Safari 18.2+, and is partial in Firefox 144+. `@view-transition{navigation:auto}` into the game is a free enhancement where supported. |
| Cursor effects | **Skip globally; scope to one object** | Never replace the system cursor. A page-wide spotlight (Brittany) is the most I'd do; better to light only the hovered card. Gate with `(hover:hover) and (pointer:fine)`. |
| Subtle 3D / tilt | **One object only** | A holographic credential card in the hero (see Direction C). Pointer-only, rAF-throttled, capped at about 8°, static under reduced motion. |
| Noise / grain | **Skip or static** | Printstream is "matte". A pre-rendered noise tile at 3–4 % is fine. A live `feTurbulence` filter over the page costs repaints on mid-range phones. |
| Iridescent CSS (`@property` + conic gradients) | **Use, scoped** | `@property` is Baseline since July 2024. Animate `--angle` on focus, hover and active borders, and on the one hero object. That matches DESIGN.md: holo only for interactive or high-priority states. |
| Dark / light skins | **Use (already built)** | Keep the pre-paint script and `prefers-color-scheme`. Print always uses the white skin. |
| Preloaders, scroll-jacking (Lenis/Locomotive), skill % bars, autoplay sound, carousels for experience | **Never** | Each costs time, accessibility or credibility with this audience. Dennis's CLS of 0.47 shows what a preloader does. |

## 4. Guardrails

**Performance targets**
- CWV "good" at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (web.dev).
- Self-imposed budget [J]: Lighthouse mobile (Moto G Power, slow 4G) LCP ≤ 1.8 s, initial transfer ≤ 150 KB compressed (homepage today: 129 KB), JS ≤ 15 KB with no framework, no third-party scripts or analytics tags, ≤ 4 font files.
- LCP element = the H1 text. No hero image. Images get `width`/`height`, `loading="lazy"` and `decoding="async"`. Pixel sprites are PNG with `image-rendering: pixelated`.

**Fonts**
- Preload only Geist 700 Latin (the H1), with `crossorigin`.
- Body Inter 400 uses `swap`, with a metric-matched fallback (`size-adjust`, `ascent-override`, `descent-override`) so the swap doesn't shift layout.
- Keep the inlined JetBrains Mono subset, but rebuild it to cover every glyph used.
- Consider `font-display: optional` for Inter 500 [J].

**Motion**
- Everything decorative goes inside `@media (prefers-reduced-motion: no-preference)`.
- The homepage's global `.001ms` kill switch is a good backstop. State changes (colour, focus) must still show without motion.
- Animate only transform and opacity. No `backdrop-filter`. Use `will-change` only while hovering.

**Contrast**

Computed WCAG ratios for the homepage tokens:

| Token | Black skin (bg / surface) | White skin (bg / surface) |
|---|---|---|
| text | 14.4 / 12.8 | 15.6 / 17.2 |
| muted | 10.9 / 9.7 | 8.5 / 9.4 |
| outline-strong | 5.8 / 5.2 | 5.3 / 5.9 |
| outline | **1.98** | **1.55** |
| holo-1 | 13.8 | **3.38** (2.87 on surface-hi) |
| holo-2 | 11.1 | 5.04 |
| holo-3 | 14.3 | 4.34 |

What follows:
- (a) Holo-gradient text in the white skin is for large text only (≥ 24 px, or ≥ 18.66 px bold). Never use it for 12 px mono labels.
- (b) `--outline` is decorative only. Interactive boundaries (inputs, buttons, toggles) use `--outline-strong` to meet the 3:1 non-text rule (WCAG 1.4.11).
- (c) The focus ring (holo-2) passes in both skins.
- Keep the `prefers-contrast: more` path. Add `forced-colors: active` handling: holo becomes `Highlight`, and chamfer borders need real borders.

**Keyboard and screen readers**
- Skip link. One `<h1>` (the name). An `<h2>` per section.
- `<article>` per role. `<ol reversed>` for the timeline. `<time datetime="2024-08">`. Date ranges get `aria-label="August 2024 to present"`.
- `<dl>` for the facts and numbers strip. `<details>` for case studies.
- `aria-current` on the scrollspy link. Visible `:focus-visible` (already in place). Targets ≥ 24×24 px (WCAG 2.5.8).
- The tilt card is not a focus trap. Decorative layers get `aria-hidden` and `pointer-events: none`.

**Print**
- `@media print`: force the white skin and keep the chamfers as outlines (backgrounds don't print by default).
- Hide the nav, toggle, game banner, decals and noise.
- `a[href^="http"]::after{content:" (" attr(href) ")"}` for key links, but not for every link.
- `break-inside: avoid` on roles. `@page { margin: 14mm }`. Aim for 1–2 A4/Letter pages.
- Open every `<details>` on `beforeprint`.
- Also link a real PDF résumé (Brittany's "View Full Résumé" pattern).

**No-JS**
- All content lives in static HTML.
- JS only adds: scrollspy, tilt, skin toggle, copy-email, the view-transition wrapper.
- Use `<html class="no-js">`, swapped by an inline script. Hide JS-only controls under `.no-js`.

**Search and sharing**
- `<title>`: "Naman Gururani — Software Engineer, Streaming Data". Meta description. Canonical. `lang="en"`.
- OG/Twitter image: a 1200×630 static PNG of the hero card.
- JSON-LD `Person`: `name`, `jobTitle`, `worksFor: Barclays`, `alumniOf: SRM IST`, `sameAs: [GitHub, LinkedIn]`, `url`.

**Discretion (bank)**
- No internal system names, screenshots or real-looking payment data.
- Synthetic visuals are labelled.
- Numbers are only ones already public on the profile and in the game.

## 5. Directions

Content order for all three [J]:
1. Hero: name, role @ employer, one-line value, location / local time, Email · LinkedIn · GitHub · PDF.
2. Game banner.
3. Impact strip.
4. Experience.
5. Projects: Enlacey, the game, other public work.
6. Skills, grouped; no bars.
7. Education (CGPA up front for admissions).
8. Writing: the latest 2 blog posts.
9. Contact.

### A. "Datasheet"
The page is laid out like the datasheet for an electronic part.
- **Hero:** The H1 name. A part-number line in mono: `PS-RES-01 · SOFTWARE DEVELOPMENT ENGINEER · BARCLAYS`. A "Key characteristics" table holds the impact numbers, with min/typ/max-style columns (Throughput: ~750M records/day; Latency: 8 h → real-time; GPA: 9.63/10).
- **Sections:** Numbered "§01 Experience" sections with technical-drawing decals: dimension lines and 45° hatching, in the spirit of Chánh Đại but quieter. The career appears as a **revision table**: Rev A, DevOps Intern, Jun–Aug 2023; Rev B, SDE, Aug 2024–now. A promotion reads as a revision bump.
- **Signature interaction:** Hover or focus a row and a holo ✕ appears while a dimension line draws across the row (clip-path). The skin toggle is a 45° chamfer-wipe view transition.
- **Game banner:** "Appendix B — Interactive build". A chamfered inverse strip with a small pixel sprite: "The same résumé as a pixel-art fair · ~3 min · works on phones · skip button in every game  ▶ ENTER".
- Prints beautifully. Risk: a dry read unless the decals are crisp.

### B. "Event Log"
The career told as a stream of events.
- **Hero:** The H1 static. Under it, a thin `aria-hidden` lane of synthetic event squares slides left to right through a "lineage" line (CSS transform loop, paused under reduced motion, labelled "illustrative").
- **Sections:** Brittany-style two columns. The left column holds mono offsets and timestamps (`offset 0007 · 2024-08`). The right column holds the event body (`ROLE_CHANGED intern → sde`).
- **Signature interaction:** A scroll-driven holo rail fills down the timeline (`animation-timeline: view()`). Nodes "commit" (fill solid) as they cross the viewport centre.
- **Game banner:** Logged as a special event: `EVENT ∞ · side-quest — this résumé is also a game` in a pixel strip.
- Risk: motion near the LCP element, and the "payments stream" imagery comes close to the discretion line.

### C. "Holo Credential" ← pick
- **Hero:** A chamfered credential card carries the scannable facts as real HTML: name (the H1), role, employer, "since Aug 2024", location, a serial `PS-ID-0824`, contact buttons. With a fine pointer, it tilts up to about 8° and a foil layer tracks the pointer: a conic-gradient on registered `@property` angles, a repeating hairline texture, `mix-blend-mode: soft-light`. On touch, the foil sweeps once on load. Under reduced motion it is static foil.
- **Sections:** Below the card the page goes quiet. Brittany-style sticky left rail on desktop (the card shrinks to a mini badge plus scrollspy). Datasheet-style numbered sections borrowed from A. One company rail with intern → SDE nodes. A `<dl>` impact strip.
- **Signature interaction:** The card itself. Secondary: the chamfer-wipe skin transition.
- **Game banner:** A second, smaller card styled as the fair's **"ADMIT ONE" ticket**: perforated edge via a radial-gradient mask, pixel-art Bo or turnstile sprite, the same foil on hover. It echoes the game's own opening (Bo hands you a ticket at the booth). It sits right under the hero and again at the end, with a cross-document view transition into the game where supported.

**Why C [J]:**
- It is the only direction where the "wow" object *is* the information. The first thing a recruiter sees, and what draws their eye, is name / role / Barclays.
- It uses the holographic accent exactly as DESIGN.md says (on interaction, on a high-priority object).
- It ties the résumé to the game through the ticket.
- It costs about 2 KB of TS + CSS, with no WebGL, and degrades to a handsome static card in print, no-JS and reduced motion.
- A is the safest and B the most "engineer", but neither has a moment people will remember.

### Implementation sketch for C (plain TS/CSS)

```css
@property --fx { syntax:'<percentage>'; inherits:false; initial-value:50%; }
@property --fy { syntax:'<percentage>'; inherits:false; initial-value:50%; }
@property --fa { syntax:'<angle>'; inherits:false; initial-value:0deg; }
.badge { transform: perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); transition: transform .3s; }
.badge::after { /* foil */ content:""; position:absolute; inset:0; pointer-events:none; clip-path:inherit;
  background: conic-gradient(from var(--fa) at var(--fx) var(--fy), var(--holo-1), var(--holo-2), var(--holo-3), var(--holo-1)),
              repeating-linear-gradient(115deg, #fff1 0 1px, transparent 1px 4px);
  mix-blend-mode: soft-light; opacity:.0; transition: opacity .3s; }
@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) {
  .badge:hover::after { opacity:.55; }
}
@media (hover:none) and (prefers-reduced-motion:no-preference) {
  .badge::after { animation: sweep 1.6s .4s ease-out 1 both; }
}
@keyframes sweep { 0%{opacity:0; --fa:0deg} 40%{opacity:.5} 100%{opacity:.15; --fa:300deg} }
```

TS (about 30 lines):
- `pointermove` on the card only, coalesced with `requestAnimationFrame`.
- Sets `--rx`, `--ry` (±8°), `--fx`, `--fy`.
- Resets on `pointerleave`.
- Bails if `matchMedia('(prefers-reduced-motion: reduce)')` or `(pointer: coarse)` matches.

Skin toggle:
- `document.startViewTransition?.(() => flip())`.
- `::view-transition-new(root){animation: wipe .5s}`, where `wipe` animates `clip-path: polygon()` from the top-left along a 45° diagonal.
- Under reduced motion: no transition.

## 6. Sources

- Printstream: `C:\AntiG\DESIGN.md`; https://naman-gururani.github.io/ and its CSS `/_astro/Base.NpWxv3Na.css`; `C:\AntiG\lineage\src\data\content.ts` (facts).
- Sites: as listed in the §2 table.
- Bruno Simon case study: https://www.awwwards.com/brunos-portfolio-case-study.html
- Henri Heymans SOTD (an Awwwards archetype): https://www.awwwards.com/sites/henri-heymans-25
- Holo-foil technique: https://github.com/simeydotme/pokemon-cards-css (demo https://poke-holo.simey.me)
- CWV thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
- Fonts: https://web.dev/articles/font-best-practices
- `animation-timeline` / `view()` Baseline 2026 (Oct 2026): https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/view
- Same-document VT Baseline: https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
- Cross-document VT support: https://caniuse.com/cross-document-view-transitions
- Interop 2026 (scroll-driven animations, cross-document VT): https://hacks.mozilla.org/?p=48246
- `@property` Baseline: https://web.dev/blog/at-property-baseline
- Recruiter scan: https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/ ; critique https://www.ere.net/articles/is-the-6-second-resume-scan-a-myth
- read.cv shutdown: https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/
- Admissions: https://informatics.indiana.edu/apply/portfolio-guidelines.html ; https://forum.thegradcafe.com/topic/44918-personal-website-yay-or-nay/page/2
- Bento critique: https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide ; https://visual-movements.pages.dev/movements/bento/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
