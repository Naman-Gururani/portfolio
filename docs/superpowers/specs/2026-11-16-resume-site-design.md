# v6 — the résumé site at /portfolio/ (design)

**Date:** 2026-11-16 · **Owner:** Naman · **Branch:** `v6/resume` (game repo `Naman-Gururani/portfolio`, local folder `C:\AntiG\lineage`)
**Research behind it:** `docs/superpowers/research/2026-11-15-resume-site/` (recruiters, admissions, design) and the college project's `reports/Resume narrative LinkedIn admissions criteria.md` §5, §7, §8.

## 1. Intent

`naman-gururani.github.io/portfolio/` stops being the game and becomes a résumé site. A banner at the top leads to the game, which moves to `/portfolio/play/`. The readers are graduate-admissions readers (Cornell Tech, CMU MSE, Berkeley MEng, CMU-SV MSSM, Georgia Tech, Toronto MScAC, Waterloo MDSAI, UIUC MCS), who click a link printed on his CV, and recruiters and hiring managers. Both give it about a minute, and both decide in the first screen.

The site carries **more detail than the game**. The game's cards stay brief. The site is where the full record lives: dated steps, results, the paper, leadership, coursework. Naman asked for the design to be "really catchy and feel worth it", with a **glassy 3D look**, **dark by default**.

## 2. Goals, non-goals, anti-goals

**Goals**
- The first screen answers, in about 7 seconds:
  - name;
  - current title and employer;
  - dates;
  - education with CGPA and rank;
  - the paper;
  - Enlacey.
- One minute is enough for the rest: experience with a result on every line, the promotion shown as dated steps, three or four project write-ups that state his own part, the publication, leadership, writing, skills and contact.
- It looks like a crafted object: a holographic glass "credential" hero, layered glass panels with real depth, and a game ticket that you want to click.
- It is fast and robust:
  - all content is real HTML text, with no dependence on JavaScript;
  - fast on a mid-range Android phone;
  - prints to a clean one- or two-page CV;
  - shares with a proper link preview.
- There is one fact file. The game's résumé facts come from the same record, so the two can never disagree.

**Non-goals**
- No hosted résumé PDF. There would be two orderings, and a public file is a confidentiality risk. A "Print / Save as PDF" button prints the page instead.
- No CMS, no framework, no analytics, no visitor counters.

**Anti-goals: these would make it a failure even if it works**
- Anything that signals applying or job-hunting: no IELTS, no target schools, no "seeking", no "open to work", no "prospective". His manager can open the page.
- Bank-internal names, client names or exact volumes. Option B, chosen by Naman on 2026-11-15:
  - Engineering detail is allowed.
  - Scale is given as orders of magnitude.
  - No internal system, team or project names.
  - Vendor products are allowed only where they are already public in his materials. The legacy stack is "a legacy batch ETL stack".
- Placeholder sections, "TODO", "coming soon" filler, or a number that is not in a source.
- Motion that hides content, scroll-jacking, a loading screen, skill bars.

## 3. Facts (the master record) and their sources

Every fact on the page comes from one of these sources:
- (FS) the Toronto referee fact sheet, https://claude.ai/artifact/H9kckrmHs15dQqEKZFB5oH, 15 Nov 2026;
- (RC) the SRM rank certificate, `C:\Imp Documents\Certificates\Naman Gururani_RA2011003030149_Rank Details.pdf`, 15 Sep 2026;
- (CT) `src/data/content.ts`;
- (EN) the Enlacey repo, `docs/case-study.md` and `JARVIS.md`;
- (N) what Naman said in this session.

| Fact | Value on the page | Source |
|---|---|---|
| Title | **Data and Backend Engineer** | N (2026-11-16) |
| Employer | Barclays, India | CT, FS |
| Internship | DevOps Intern, Jun–Aug 2023, converted to a full-time offer | CT, FS |
| Full time | Since Aug 2024 | CT |
| Promotion | BA3 → BA4, 2025 | FS |
| Degree | B.Tech, Computer Science and Engineering, SRM Institute of Science and Technology, Delhi-NCR campus, 2020–2024 (completed May 2024) | FS, RC |
| CGPA | 9.63 / 10, as issued, never converted; SGPA 10.00 in two semesters | FS |
| Rank | "Among the top 5% of rank holders, B.Tech CSE, batch 2020–2024", certified by the Controller of Examinations. The certificate gives no cohort size, so none is shown. | RC (Naman's "~4000+ across all branches" is not on the certificate) |
| Paper | "Healthcare Assistance Using AIML", co-authored with Ms. Anjali Malik (SRM), from the major project he led. Venue, year and DOI are not yet known, so they are shown nowhere until Naman gives them. | FS |
| Enlacey | Founder. An India-first local-services marketplace, live on Google Play since Oct 2026, launching in Haldwani; iPhone coming soon. No traction numbers until Naman gives them (Jarvis reminder 2026-11-30). Play link `https://play.google.com/store/apps/details?id=com.enlacey.app`; site `https://enlacey.com`. | N, EN |
| Activities | Class representative of his section. GeeksforGeeks student chapter, technical core team (2022–2024). Computer Society of India, core team, management (2021–2022). The only SRM team at the KIET hackathon. Smart India Hackathon participant. | FS, the certificates folder |

The experience bullets come from FS and the Barclays letter draft, held to option B. Their order, strongest first:
1. **The payment lineage engine.** He designed it from a blank page and owns it end to end. It traces each payment across about 20 source systems and hundreds of millions of events a day. Technique: union-find grouping, atomic Redis updates through Lua scripts, distributed locks for merges, and a DynamoDB tier for events that arrive late. He gathered requirements from several business analysts, built the cost model, and ran system and performance testing with two other teams.
2. **The move off the legacy batch stack.** He was one of the first developers on moving corporate-payments data from a legacy batch ETL stack to real-time Java streaming. His proof-of-concept Flink and Kafka Streams code became the template for the team's new applications.
3. **The connector.** An ISO 20022 connector from IBM MQ to Kafka, which the framework team reused as the base for its generic version. He ran adoption sessions for it.
4. **Data protection.** Tokenising sensitive customer data in UK payment flows, which was critical-priority work he carried from design to handover, and jurisdiction controls that decide where payment data may be processed.
5. **Operability.** Dashboards and alerts on ELK and Snowflake, built on his own initiative, plus a 60-step start-of-day checklist and alert runbooks.
6. **Teaching.** Ran sessions on Java and the streaming stack for colleagues moving across from the legacy stack.
7. **The hackathon.** A 24-hour team prototype that automates loan rollovers and their interest payments. Estimated effect: 95% faster, about 2,000 manual hours a month saved. The owning team's director plans to implement it.
8. **The internship.** Automated the loading of process exceptions into an analyst portal through a secured OAuth 2.0 REST API, turning an 8-hour delay into real time, using Python, KornShell and Teradata.

The game copy is aligned to the same record: the new title, the scale as an order of magnitude, and Enlacey named and live. The game's "Open to" and "Looking for a … engineer?" lines are left as they are, because Naman wrote them in September. They are flagged to him.

## 4. Approaches

Chosen by Naman on 2026-11-15:
- **1. In the game repo (chosen).** A Vite multi-page build: `/portfolio/` is the résumé and `/portfolio/play/` is the game. It keeps one fact file and needs no repo rename. The cost is that the Printstream look is rebuilt in this repo.
- **2. In the homepage repo.** It would get the existing layout for free, but needs a second repo rename and leaves the facts in two places.
- **3. A résumé overlay on the game page.** Dropped, because phones would load the 1.5 MB engine first.

## 5. The design

The design direction is **"Holo Credential", in glass**. It builds on the design research's pick, with the 3D glass look Naman asked for.

**Scene.** The page is dark by default (`#0b0b0c`), on a fixed background layer that carries:
- a fine dot grid;
- three large, very soft holographic glows (cyan `#a9e8ff`, violet `#e5c5ff`, pink `#ffc6e3`), drifting slowly by transform only, frozen under reduced motion;
- a faint perspective grid "floor" receding under the hero.

The glass panels sit over this scene, so the translucency has something to show.

**Glass.** A panel is built in layers:
- a translucent white gradient (about 7% to 2%);
- `backdrop-filter: blur(18px) saturate(1.5)`, limited to a handful of large panels, with an opaque fallback;
- a 1px inner highlight on the top edge and a dark inner edge on the bottom;
- a deep, soft drop shadow;
- a specular sheen that follows the pointer through `--mx`/`--my`.

Panels lift slightly toward the viewer on hover (translate plus shadow). Printstream decals stay: a mono serial at top right (`PS-…`), small ✕ marks, and chamfered corners on buttons, chips and the ticket.

**Hero, the credential.** A glass ID card holds the facts as real HTML:
- name (the H1);
- title;
- Barclays · India;
- "Engineer since Aug 2024 · intern 2023";
- a summary line covering the degree, CGPA 9.63/10, top 5%, the paper and Enlacey on Google Play;
- contact buttons: copy email, GitHub, LinkedIn, Print.

The card has depth and motion:
- It sits in 3D space (perspective) with layered parallax depth: the foil, the text and the chip sit at different `translateZ` values.
- With a mouse it tilts toward the pointer, up to about 10°, while a holographic foil (a conic and linear gradient blended with `color-dodge`/`overlay`) and a glare spot follow the pointer.
- On touch it gently sweeps the foil once on load.
- Under reduced motion it is a static foil.

Beside it on desktop (below it on phones) are a three-sentence About and an "Interests" line.

**The game banner.** It appears twice.
- **At the very top:** a slim glass ribbon, "▶ Prefer to explore? Play the portfolio — a pixel-art fairground", with a ticket stub.
- **After the projects:** a full "ADMIT ONE" ticket card. It has a perforated edge, a real screenshot of the fair, a holographic foil on hover, and the line "Same résumé, as a game: Wordle ticket, a career coaster, a claw machine of projects. Skip buttons everywhere."
- Both link to `/portfolio/play/`.

**Navigation.** A sticky glass top bar holds:
- the monogram;
- section links that highlight the section in view (`aria-current`);
- the skin toggle (dark default, pearl-white optional, stored under its own key);
- "Print".

On phones the section links become a horizontally scrollable row.

**Sections, in order:**
1. **Impact strip.** Four glass tiles, each a number with a unit and a noun:
   - "~20 source systems traced end to end";
   - "100s of millions of payment events a day";
   - "8 h → real time";
   - "~95% faster, estimated (hackathon)".
   - Each states its basis.
2. **Experience.** A vertical timeline for Barclays with the three dated roles stacked, promotion and conversion labelled. A holographic line fills down it as you scroll (CSS `animation-timeline: view()` behind `@supports`, static otherwise). The bullets from §3 are numbered; the top three are visible and the rest are in a native `<details>` "More from this role". The lineage engine gets an expandable "How it works" with the technique.
3. **Projects.** Glass cards in a 2-column grid on desktop:
   - **Enlacey** (large card): what it is, his part, the stack, two engineering highlights (first-accept-wins dispatch with row locks; hybrid Hinglish keyword and semantic search), and links.
   - **Healthcare Assistance (AI/ML)**: led, graded O, became the paper, cross-validated, framed as decision support.
   - **Naman's World Fair**: the game; Phaser 3 and TypeScript, about 1,180 tests, built spec-first with Claude Code.
   - **Safe Stride**: fall detection and SOS; GitHub.
   - **Flight Delay Predictor**: minor project, team lead, graded O.
4. **The ticket.**
5. **Education.** The degree, CGPA as issued, the two 10.00 semesters, the rank exactly as certified, and selected coursework only where the grade is known (DBMS: O).
6. **Publication.** The citation as far as known, plus a contribution line.
7. **Leadership and activities.** Dated lines with scope.
8. **Writing.** The posts, from a list in the fact file, linking to the blog.
9. **Skills.** Grouped plain lines with no bars:
   - Languages: Java, Python, SQL, C++.
   - Streaming: Kafka, Kafka Streams, Flink, IBM MQ.
   - Data: Redis, DynamoDB, Snowflake, Teradata.
   - Platform: Spring Boot, AWS, Docker, Linux, ELK, Git.
   - Way of working: spec-first, AI-assisted development.
10. **Contact.** Email (copy), GitHub, LinkedIn, blog, homepage.

The footer carries "Updated Nov 2026" and a link to the homepage.

**Motion budget.** The motion is limited to:
- the hero tilt and foil;
- the background drift;
- the timeline fill;
- a short reveal per section (fade and 12px rise, CSS only, content visible when unsupported);
- hover lifts;
- the skin switch as a diagonal view transition.

Everything is off under `prefers-reduced-motion`. Only transform and opacity animate.

**Type.** Geist (700/600) for headings, Inter (400/500/600) for body, JetBrains Mono (500) for labels and serials, self-hosted latin subsets through `@fontsource`. Only Geist 700 is preloaded.

**Accessibility:**
- a skip link, one H1, an H2 per section;
- `<article>` per role and project, `<time>` dates, a `<dl>` for facts;
- visible focus with a holographic ring;
- contrast of at least 4.5:1 for all text in both skins, with holographic colours never used for small text in the white skin;
- 24px or larger tap targets;
- a `forced-colors` fallback.

**Print.** White, no scene, no banner or navigation, details open, link URLs printed, one or two A4 pages.

**Sharing and search:**
- `<title>Naman Gururani — Data and Backend Engineer</title>`;
- description, canonical, Open Graph and Twitter tags;
- an OG image (1200×630, under 300 KB) made from the rendered hero;
- JSON-LD `ProfilePage` → `Person` (`jobTitle`, `worksFor` Barclays, `alumniOf` SRM IST, `sameAs` GitHub, LinkedIn and the Play listing).

**Performance budget.** LCP ≤ 1.8 s in a Lighthouse phone run, JS ≤ 15 KB (no framework), first load ≤ 200 KB including fonts. The game's 1.5 MB never loads on this page.

## 6. Mechanics

- `vite.config.ts` becomes multi-page: `index.html` is the résumé and `play/index.html` is the game; `base` stays `/portfolio/`.
- A Vite plugin renders the résumé markup at build and dev time, from `src/resume/render.ts` (a pure function of the fact file), into `index.html`. The page is therefore complete without JS.
- `src/data/resume.ts` is the master record. `src/data/content.ts` imports the shared facts (profile, title, dates, CGPA) from it.
- A small inline script in `index.html` forwards old game links: any of `fresh`, `cheat`, `word`, `duck`, `st` in the query → `location.replace('/portfolio/play/' + search + hash)`. The logic is a pure, tested function.
- `src/resume/main.ts` (≤ 15 KB) adds the tilt and foil, the section highlight, copy-email, the skin toggle and print.
- Tests (vitest):
  - the renderer output contains every section and fact;
  - the game and résumé facts agree;
  - a banned-words check (`IELTS|TOEFL|GRE|admission|applying|application|Cornell|Carnegie|Berkeley|Toronto|Waterloo|Georgia Tech|UIUC|open to work|seeking|hire me|prospective`) over the rendered page;
  - every external link is https;
  - the JSON-LD parses;
  - the forwarding function;
  - the existing `index-html.test.ts` moves to `play/index.html`.
- The build emits `dist/index.html` (résumé) and `dist/play/index.html` (game).

## 7. The rest of the brief, in order after the site

- **Homepage repo** (`C:\AntiG\naman-gururani.github.io`):
  - "data engineer" → "Data and Backend Engineer";
  - the Enlacey card → "Live on Google Play · iPhone soon";
  - the hero buttons become "Résumé" → `/portfolio/` and "Play the portfolio" → `/portfolio/play/`;
  - `public/lineage/index.html` → `/portfolio/play/`;
  - blog polish: an author card linking the résumé, previous and next posts, a table of contents on long posts, per-post Open Graph tags;
  - post #1's game links → `/portfolio/play/`, with an "updated" note.
- **New posts,** drafted for Naman's review before any goes live, held to the option-B rules:
  - "Exactly one provider gets the job: first-accept-wins with row locks" (Enlacey);
  - "Searching in Hinglish: hybrid keyword and semantic search" (Enlacey, college tracker T-13).
  - The Kafka exactly-once post (T-12) waits for his ten answers.
- **GitHub profile:** the banner subtitle → "DATA & BACKEND ENGINEER // PAYMENTS & STREAMING", and a fourth typing phrase, "building Enlacey, live on Google Play".

## 8. Shipping

- Work happens on `v6/resume`, with local commits.
- Push, deploy (`npm run build && npx gh-pages -d dist`) and the homepage and profile pushes happen only when Naman says go.
- Target: live by about 25 Nov.
- The homepage and game deploys ship together, so `/portfolio/` and the homepage buttons change at the same moment.

## 9. Left to the builder

- Exact glass values, glow positions and decal placement.
- The ticket's screenshot crop.
- Responsive breakpoints.
- Copy wording within the facts and rules above.
