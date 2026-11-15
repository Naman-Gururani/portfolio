# Guide, Printstream & Profile — design (2026-09-14)

> **Status (2026-09-25):** implemented across all three repositories and **published 2026-09-23** — game at naman-gururani.github.io/portfolio (repo renamed `lineage` to `portfolio`), Printstream homepage and blog live, GitHub profile rebuilt. Deliberate departures: the homepage hero kept the owner's "Naman's World" brand instead of §C2's role-line kicker; the profile's stats card dropped commits, stars and issues; §C1's white-on-black contrast-flip cards, 4px radius and link-hover holo underline became tonal cards, sharp corners and nav/button accents. Every deviation from it, and why, is in `docs/superpowers/2026-09-23-rulings.md`.

One brief from the user, five deliverables across three repositories:

| # | Deliverable | Repository (local clone) |
|---|---|---|
| A | Phone guidance in the game: descriptive buttons, blinking, Missions, "Take me there" | `lineage` → renamed `portfolio` (`C:\AntiG\lineage`) |
| B | `/lineage` becomes `/portfolio` | all three |
| C | Homepage + blog restyled in the **Printstream** look | `Naman-Gururani.github.io` (`C:\AntiG\naman-gururani.github.io`) |
| D | GitHub profile rebuilt: bigger, animated, with live stats | `Naman-Gururani` (`C:\AntiG\github-profile`) |
| E | A recorded walkthrough video of the whole portfolio | produced from all of the above |

## User rulings (2026-09-14, recorded verbatim in substance)

1. **"Printstream format"** = the CS2 Printstream skin look, i.e. the *Monochrome Pearlescence* system in `C:\AntiG\DESIGN.md`. Applies to the **whole site** (homepage, blog index, posts, 404).
2. **Phone guidance** = the full guided tour, **but it activates only when the player taps "Take me there"**. Otherwise the fair stays an open game: no forced coach marks, no tour on first run.
3. **Profile hero** = an animated pixel scene of a developer typing at a desk. It must be a **generic character**, not Naman's likeness and not the game's hero sprite.
4. **Rename** = done by Claude through the GitHub REST API, using the credential git already stores for github.com.
5. Standing repo rule still holds: nothing is committed, pushed or deployed without the user's go-ahead. The rename is authorized, but it is executed in the publish step (§B.3), together with the deploys, because renaming alone would break the live site.

---

## A. Game — guidance on phones

The complaint: players on phones do not know what to do or where to go, the A/B buttons say nothing, and nothing tells them what to tap. Laptop is fine and must not regress.

### A1. Descriptive touch buttons

- The **action button** (was `A`) becomes a large pill/disc showing an **icon + verb** for whatever is in range: `TALK`, `RIDE`, `PLAY`, `READ`, `OPEN`, `HOOK`, `TAKE`, `PET`, `SWITCH`. With nothing in range it reads `SWING` (the wrench — it cuts grass) and is visually dimmed.
- The **hop button** (was `B`) reads `JUMP` with an up-arrow icon.
- Source of the verb: an optional `verb` field on the `Interactable` registered in `systems/Interact.ts`; the `ui:prompt` event carries it (`{ text, key, verb }`). Every `interact.add` call site in `WorldScene` sets one. A pure `verbFor(interactable)` fallback (derives from the `interact` kind: `booth:*`/`Talk to *` → TALK, `ride:*` → RIDE, `minigame:*` → PLAY, `panel:*` → READ/OPEN, …) keeps any unlabelled future interactable from showing a blank.
- `aria-label` follows the verb ("Ride the Career Coaster"), so screen readers hear the same thing.
- The welcome card's touch legend is rewritten to match: *Move — drag the stick · Jump — JUMP · Do things — the big button; it names what it will do*.

### A2. Blink ("nudge") on anything that needs a tap

One shared CSS treatment, `.nudge`: an expanding ring plus a slight glow, ~1.1 s cycle. Under reduced motion (OS or in-game toggle) it degrades to a static bright outline — never removed, so the cue survives.

Applied exactly where a tap is the next thing the player must do:

| Control | When it blinks |
|---|---|
| Touch action button | an interactable is in range |
| Desktop prompt key chip | same (the existing bob stays; the ring is added) |
| Dialogue continue | a line has finished typing (the `▼` becomes a tappable "Tap to continue" on touch) |
| Ride card **Next ▶** | from the moment the card lands |
| Welcome **Start** | while the welcome card is up |
| Map **Travel ▶** | once a travel target is selected |
| **Missions** button | three pulses when the next story mission changes, then stops |
| Guided walk arrival | the action button blinks with the destination's verb |

Nothing else blinks; a screen full of blinking is no cue at all.

### A3. Missions sheet

- New panel `src/ui/missions.ts` (+ `src/styles/missions.css`), opened from a new HUD **Missions** button (all devices; a flag icon, labelled on wide screens). The **objective chip** opens Missions instead of the map. The map keeps its own button and key (M).
- Content model is pure data, `src/data/missions.ts`: one entry per attraction, in story order, then the side attractions:
  1. **Get your ticket** — Ticket Booth. *Talk to Bo, solve his five-letter word.* Unlocks: About, entry to the fair.
  2. **Ride the Career Coaster** — *Hop in and ride; a card appears at each stop.* Unlocks: Experience, Education.
  3. **Win the prizes** — Prize Tent. *Play the claw machine.* Unlocks: the projects.
  4. **Spell the toolkit** — Word Forge. *Make words from the letter wheel.* Unlocks: Skills.
  5. **Sign the guestbook** — *Leave a note by the exit.* Unlocks: Contact.
  - Side: **Chalk Flight** (a flappy game, wins a hat) · **Arcade** (Crew Drop, out-last the bots) · **Duck Pond** (hook three ducks for Tomas).
- Each row shows: status (**Done ✓** / **Next** / **Open**), name, the one-line *what you do*, the *what you get*, and a **Take me there** button. Every game's "show me the answers" door is mentioned once at the top of the sheet: *Stuck? Every game has a "show me" button.*
- Before the ticket is won, rows 2–8 read *Get your ticket first* and their Take me there routes to Bo.
- Copy rules carry over: no résumé facts and no digits in this copy (it describes the game, the cards hold the facts); names come from `Attraction.name` (single source).
- A test pins that the mission list covers every attraction id exactly once.

### A4. "Take me there" — the guided walk

The only thing that starts the tour.

- **Route (pure):** `src/systems/guide.ts` builds a tile path from the player's tile to the attraction's door with the existing `astar` in `world/paths.ts`, using a cost function built from the scene's collision data (terrain blocking, `boundarySolids`, `structureSolids` with the current flags, `attractionSolids`). Collinear steps are collapsed into waypoints. No Phaser, no DOM — unit-tested.
- **Walking:** `WorldScene` gets a `guide` state. Each frame, while guiding, the movement block feeds a unit vector toward the next waypoint into `player.move` at the normal run pace — the same code path the stick uses, so collision, animation, step counting and region banners all behave.
- **Showing the way:** a bouncing arrow over the destination door, a trail of fading dots along the remaining path, and a slim top bar: *Guiding you to Career Coaster — move to stop*. The camera follows as usual.
- **Stopping:** any manual input (stick, keys, gamepad), opening any modal, or a cutscene cancels it immediately. On arrival the player faces the door, the trail clears, and the action button blinks with the door's verb (A2).
- **Recovery:** no forward progress for 1.5 s → re-route once; still stuck → fall back to the existing fade-travel (`travelTo`). The guide may walk to **undiscovered** attractions (finding them is the point); map fast-travel stays limited to discovered ones.
- Works identically with keyboard and mouse on desktop.

### A5. What does *not* change

No first-run coach marks or forced tutorial (ruling 2). Bo's arrival, the story spine, save schema v4 and every game stay as they are. One optional line only: after Bo's intro on a touch device, the existing hint toast says *Lost? Tap Missions — it can walk you there.* once per save.

### A6. Testing

- Unit: `guide.ts` routes (open lawn, around the coaster spans, blocked by turnstiles before the ticket, unreachable → null), waypoint collapse; `verbFor` on every registered interactable; `missions.ts` covers all 8 attractions and gates on the ticket; the nudge class toggles in the touch/prompt/ridecard/dialogue renderers (happy-dom).
- Existing gates stay green: vitest, `tsc --noEmit`, build.
- Browser, static preview, touch-emulated 390×844 portrait and 844×390 landscape plus 1280×800 desktop: labels change with range, blinking present, Missions opens from the chip, Take me there walks to the coaster door and cancels on stick input, fallback travel works from a boxed-in spot.

---

## B. `/lineage` → `/portfolio`

### B1. Code changes (made and verified before publishing)

- `lineage` repo: `vite.config.ts` base `/portfolio/`; `index.html` canonical/OG URLs; `README.md`; `package.json` name/description; any test pinning the URL; `.claude/commands/getcontext.md`; `docs/HANDOFF.md` run instructions; scratch scripts are local tooling and are updated only where reused (the video script).
- Homepage repo: every `/lineage/` link → `/portfolio/`; a redirect page at `public/lineage/index.html` (meta refresh + canonical + `location.replace` that keeps query string and hash). A user-site path is shadowed by a project repo of the same name, so this file is inert until the rename and takes over the moment it happens.
- Profile repo: the portfolio link.
- Saves survive: localStorage is per origin, and the origin (`naman-gururani.github.io`) does not change.

### B2. Rename

`PATCH /repos/Naman-Gururani/lineage` with `name: portfolio`, plus a current `description` (the old one still describes the v1 data-pipeline site) and `homepage: https://naman-gururani.github.io/portfolio/`. Token from `git credential fill` for `github.com`, used in-process for this call only, never written to disk or logs. GitHub keeps git redirects for the old repo name; the local remotes of `C:\AntiG\lineage` and `C:\AntiG\lineage-ghpages` are updated to the new URL anyway.

### B3. Publish order (one sitting, after the user's go-ahead)

1. All three repos built and verified locally; commits prepared on each.
2. Push the homepage (redirect + Printstream). Its `/lineage/` redirect is shadowed until step 3, so nothing breaks yet; its `/portfolio/` links 404 for a minute or two.
3. Rename the repo via the API.
4. Deploy the game (`npm run build && npx gh-pages -d dist`) at base `/portfolio/`; confirm Pages is still enabled on the renamed repo.
5. Push the profile repo; trigger its workflows once (`workflow_dispatch`).
6. Verify live: `/portfolio/` loads and plays, `/lineage/` and `/lineage/?fresh=1` land on `/portfolio/` with the query kept, the homepage links resolve, the profile renders its cards.

---

## C. Homepage + blog in Printstream

### C1. Visual system

Tokens from `C:\AntiG\DESIGN.md` (Monochrome Pearlescence), implemented as CSS custom properties in `src/styles/global.css`:

- **Two skins, like the real weapon skin:** *Black* (matte `#121212` ground, white type) is the default; *White* (pearl-white ground, black type) replaces the current day theme. The existing day/night toggle becomes a *Black / White* toggle and keeps its localStorage key and no-flash script.
- **Holographic accent** (cyan → soft purple → pale pink) only on interactive highlights: link hover underline, the primary button's top edge, active nav, the hero's sheen. Animated as a slow gradient drift; static under `prefers-reduced-motion`.
- **Type:** Geist (headlines, tight tracking), Inter (body), JetBrains Mono (labels, uppercase, tracked). Self-hosted via `@fontsource`; the pixel fonts are removed from the site.
- **Shape:** sharp; 4 px radius on containers; 45° chamfered corners (`clip-path`) on primary buttons and cards; serial labels (`PS-001`…) top-right of cards; small ✕ decals and dot-grid patterns on low layers. No soft shadows: depth by contrast flips (white card on black ground) and 1–2 px outlines.

### C2. Pages

- **Home:** full-bleed hero — kicker `DATA ENGINEER // PAYMENTS & STREAMING` in mono, name in large Geist with the pearlescent sheen sweeping across it, one-sentence intro, two buttons (**▶ Play the portfolio** white/chamfered, **Read the blog** outlined). Below: four chamfered cards with serials (Portfolio · Blog · GitHub · Enlacey), then *Fresh from the Library* as a list with hairline separators and the accent chevron on hover. Existing copy is kept and tightened, not rewritten.
- **Blog index / post / 404:** same shell; post body in Inter at a comfortable measure, code blocks in JetBrains Mono on the contrasting surface, headings in Geist.
- Header/footer: the wordmark `NAMAN GURURANI` in mono caps; "designed after Lineage Isle" footer line becomes "Built with Astro".

### C3. Testing

`astro build` green; Playwright screenshots at 1440, 768, 390 widths in both skins; no horizontal scroll at 390; contrast AA on body text in both skins; reduced motion stops the sheen; every internal link resolves in the built `dist/`.

---

## D. GitHub profile

### D1. Why self-generated

The public `github-readme-stats` instance is paused (503 `DEPLOYMENT_PAUSED`) and mirrors run without tokens, so the usual stats cards render broken. Everything on the profile is therefore generated **by Actions inside the profile repo** and committed as SVG — no third-party image service at view time.

### D2. Layout (top to bottom)

1. **Banner** (`assets/banner.svg`, dark + light via `<picture>`): Printstream-styled — name, `DATA ENGINEER // PAYMENTS & STREAMING`, and a typing line cycling through three short phrases, drawn with CSS animation inside the SVG (GitHub animates SVGs embedded as images).
2. **The desk scene** (`assets/desk.svg`): a generic pixel developer — hoodie, headphones, back three-quarter view — at a desk. Loops: hands typing (2 frames), code lines scrolling on the monitor, a blinking cursor, steam from a mug, a cat tail flicking on the shelf. Pixel art drawn as `<rect>`s with CSS `steps()` animation; ~96×64 px art scaled ×5, crisp edges.
3. **Intro** — the current two sentences, a big **▶ Play my portfolio** button image linking `/portfolio/`, and link badges (Site · Blog · Email · LinkedIn `in/naman-gururani`, the handle already in the game's `content.ts`; this also replaces the README's commented-out LinkedIn placeholder).
4. **Live stats** (regenerated daily by `.github/workflows/metrics.yml`, a dependency-free Node script `scripts/cards.mjs` calling the GraphQL API with the workflow's `GITHUB_TOKEN`), all in the Printstream palette with dark/light variants:
   - **Overview** — contributions this year, commits, pull requests, public repos, stars.
   - **Streak** — current and longest daily streak from the contribution calendar.
   - **Languages** — share by bytes across owned, non-fork repositories.
   - **Heatmap** — the last 52 weeks as a pearlescent grid.
5. **Contribution snake** — `Platane/snk@v3` daily, recoloured to match, dark/light.
6. **What I work with** — the existing stack list rendered as chamfered mono chips (inline SVG, same generator).
7. **Latest field notes** — the existing blog-post workflow block, unchanged.

Private work: the cards count private contributions only if the profile setting *Include private contributions on my profile* is on. The README says nothing about this; the user is told once in the hand-back.

Local sync: the blog-feed bot commits to the profile repo on its own, so `C:\AntiG\github-profile` may be behind its remote; work starts with `git pull`.

### D3. Testing

`scripts/cards.mjs` runs locally against a recorded GraphQL fixture to render every card; a real run happens in Actions after the push. SVGs are checked in a browser at 1× and 2×, dark and light, and in GitHub's README width (~840 px) and mobile width.

---

## E. Walkthrough video

- **Tooling:** `playwright-core` (already in the npx cache) with `recordVideo`, then Playwright's ffmpeg (or `ffmpeg-static`) to produce MP4. Script lives in `scratch/demo/record.cjs`.
- **Cut 1 — Desktop, 1280×720, ~3–4 min:** homepage (both skins, scroll) → *Play the portfolio* → welcome → Bo's arrival → Wordle via its reveal button → turnstiles lift → Missions sheet → *Take me there* to the coaster → the ride with its milestone cards and the Career card → Prize Tent claw → Word Forge and the tech-stack card → guestbook and the finale → a glance at the map and Reader Mode.
- **Cut 2 — Phone, 390×844 touch-emulated, ~1–2 min:** descriptive buttons changing as you walk, blinking, Missions → Take me there, a game on touch.
- **Cut 3 — GitHub profile, ~20 s:** scroll through the new README.
- No debug UI in frame: no `?cheat=1` Skip buttons (the real reveal buttons are the feature); `?word=` only fixes the answer and is invisible. Recorded against the **live** site after publishing, or against the local preview at `/portfolio/` if the user holds the publish.
- Delivered as MP4 files under `scratch/demo/` and sent to the user's device.

---

## Order of work

1. **A** (game guidance) and **B1** code edits in the game repo — the largest piece.
2. **C** homepage restyle, including the redirect page.
3. **D** profile, cards generator and workflows.
4. User go-ahead → **B3** publish sequence.
5. **E** record the video against the published site.

A, C and D touch disjoint repositories and can be built in parallel.

## Out of scope

Real-device testing (emulation only; the user's own phone pass stays on the backlog), new games or résumé content, a custom domain, OG images, and the pre-existing backlog items in `docs/HANDOFF.md`.
