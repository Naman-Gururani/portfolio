# Research notes: what makes a SWE résumé / web résumé effective for recruiters & hiring managers (2024–2026)

Compiled 2026-11-15. Method: WebSearch + WebFetch of primary pages where reachable. Labels: **Data** (study/survey), **Expert** (named practitioner), **Anecdote** (one person's post). Vendor material flagged. Some sites failed DNS during fetch (profy.dev, teamblind.com, sia.hackernoon.com); those are cited from search snippets or mirrors and marked so.

---

## 1. How recruiters actually read

### Ladders 2012 eye-tracking (primary PDF read in full)
- URL (BU-hosted copy of the report): https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf  (despite the 2018 folder, the text is the 2012 study: "Eye Tracking Online Metacognition… Will Evans, TheLadders, 2012")
- **Data** (vendor: Ladders sells résumé rewrites — the report ends with an ad for that service). 30 professional recruiters, 10 weeks.
- ~6 seconds on the initial fit/no-fit decision, vs self-reported 4–5 minutes.
- ~80% of review time on six data points: name; current title/company; current start/end dates; previous title/company; previous start/end dates; education. "Beyond these six data points, recruiters did little more than scan for keywords"; detail copy "became filler" for the initial decision.
- Poorly organised résumés → erratic gaze, high cognitive load. Rewritten résumés: usability 6.2 vs 3.9 (Likert 1–7).
- LinkedIn profiles: recruiters fixated ~19% of time on the profile picture; ads/visual clutter "reduced recruiters' analytical capability"; "irrelevant data such as candidates' age, gender or race may have biased reviewers' judgments."

### Ladders 2018 follow-up
- HR Dive, 2018-11-08: https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/
- Secondary summaries: https://hrdailyadvisor.com/?p=65011 ; https://explore.careerbeacon.com/new-study-confirms-employers-spend-mere-seconds-skimming-your-resume-and-how-you-can-hold-their-att
- Original PDF link (csuglobal) now 404: https://csuglobal.edu/sites/default/files/blog-files/theladders-eyetracking-studyc2.pdf
- **Data** (vendor). Two-stage: unaware timing + lab eye-tracking. Avg initial screen 7.4 s. Recruiters spent more time on job titles than any other element. Top performers: clear simple layouts, clearly marked section/title headers, layouts suiting F-/E-pattern, bold job titles + bulleted accomplishments, an overview at top of page one, short declarative statements. Worst: clutter, long sentences, multiple columns, little white space, no section/job headers.
- Critique — **Expert**: Susan Gygax, ERE, 2020-10-20 — sample size, roles, résumé lengths not disclosed; number is a "vacuum metric". https://www.ere.net/articles/is-the-6-second-resume-scan-a-myth

### interviewing.io recruiter study (2024)
- https://interviewing.io/blog/are-recruiters-better-than-a-coin-flip-at-judging-resumes (Aline Lerner, Peter Bergman; Learning Collider)
- **Data** (company blog, not peer-reviewed; company sells interview practice). 76 technical recruiters (agency + in-house), ~2,200 evaluations of 1,000+ résumés, judged against mock-interview outcomes.
- Median time 31 s (25 s for advanced, 44 s for rejected). Correct interview decisions 55% ("slightly better than a coin flip"). Two recruiters agreed 64% of the time. ~15 s more time associated with 34% higher accuracy (not causal).
- Top-tier company experience → +35% chance of "interview"; strongest rejection predictor "no top firm", then MBA, "no top school", Master's.
- Follow-up opinion, **Expert** (Lerner): "Why resume writing is snake oil" — recruiters look for top companies/schools, niche skills; if you have brands, move them to the top. https://interviewing.io/blog/why-resume-writing-is-snake-oil
- Older: Lerner 2013 (~300 candidates, TrialPay): typos/grammar errors the strongest signal; top CS school no difference. https://blog.alinelerner.com/lessons-from-a-years-worth-of-hiring-data/

### Pedigree effect, 2025 market
- **Expert/Anecdote** via Pragmatic Engineer (Orosz, 2025): profiles with high-profile schools/workplaces get "up to 20–50x more reachouts". https://newsletter.pragmaticengineer.com/p/tech-jobs-market-2025-part-3 (paywalled; teaser only)
- **Anecdote collection**, Orosz 2025-10-07 "what hiring managers see": 1,700 applicants in 15 h (Spotify EM, NYC); "Inbound application quality has never been this bad"; résumés "clearly tailored by AI"; India startup HM: "AI-enhanced inbounds"; referrals "still the best channel". https://newsletter.pragmaticengineer.com/p/state-of-the-tech-market-in-2025-hiring-managers
- **Data** (vendor survey, Greenhouse 2025 AI in Hiring Report, n=4,136 incl. 1,236 recruiters/HMs, US/UK/IE/DE): 91% of recruiters have spotted candidate deception; 74% of HMs more fearful of fraud than a year ago; ~3x applications per role vs 2021 (secondary). https://www.greenhouse.com/newsroom/an-ai-trust-crisis-70-of-hiring-managers-trust-ai-to-make-faster-and-better-hiring-decisions-only-8-of-job-seekers-call-it-fair ; https://www.unleash.ai/artificial-intelligence/news/greenhouse-25-of-hiring-managers-use-ai-to-screen-applicants-yet-8-are-unsure-what-the-ai-prioritizes

### Other timing figures (weak)
- InterviewPal Aug 2025 "study" (vendor; cursor tracking, 4,289 reviews, 312 reviewers): median 1 min 34 s total. Methods unpublished — discount. https://www.interviewpal.com/blog/how-long-recruiters-actually-spend-reading-your-resume-data-study

### Screening vs depth reading (role split)
- **Expert** Gergely Orosz, Stack Overflow blog 2020-11-25: a scan of "a few seconds" for location, years of experience, languages/technologies, position and company names; second top-to-bottom read only if the scan matches. "The goal of your resume is to sell you enough to get a recruiter phone call." https://stackoverflow.blog/2020/11/25/how-to-write-an-effective-developer-resume-advice-from-a-hiring-manager/
- **Expert** Orosz, DEV 2020-12-01 "Six principles": know your readers (HMs most technical; recruiters follow instructions); no photo; in comments: recruiters/HMs "won't click through to links" under volume. https://dev.to/gergelyorosz/six-principles-your-resume-should-follow-so-recruiters-will-read-it-3a0o
- **Expert** Austen McDonald (ex-Meta Sr EM & hiring committee chair) with Neo Kim, System Design One, 2026-04-15: recruiters skim ~5–7 s for minimum reqs + "name-brand company" or relevant tech; technical screeners want "conversation starters"; onsite interviewers gauge level from business impact; HMs read finalists most closely for similar past work + ownership/growth signals. "Your bullets become interview topics." https://newsletter.systemdesign.one/p/software-engineer-resume
- **Expert** Holloway Guide to Technical Recruiting & Hiring (Ozzie Osman + contributors incl. Aline Lerner), ed. 1.0.8, 2022-08-24: "One of the surest positive signals comes from consistent increase in responsibility over a number of years"; titles not standardised; school rank "probably the one signal that's most overweighted"; many typos a strong negative. https://holloway.com/g/technical-recruiting-hiring/sections/how-to-read-a-resume
- **Expert** Swizec Teller, 2026-03-04 "Put scope on your resume": "Your title doesn't tell me much"; "The big signal in your title is upward progression"; "What did you do, for whom, what was the impact?" https://swizec.com/blog/put-scope-on-your-resume/
- **Expert/Anecdote** Andy Wheeler (data science hiring, Gainwell), 2025-11-01: wants external proof (non-homework GitHub, blog posts, solo papers); skeptical of skill lists ("people are liars") and of business-impact claims ("as easy to embellish"); asks how many HMs click portfolio links: "Probably few if any." https://andrewpwheeler.com/2025/11/01/what-to-show-in-your-tech-resume/

### Web reading patterns (general web, not recruiter-specific)
- **Data/Expert** NN/g, Kara Pernice, 2017-11-12 (reviewed 2026): F-pattern is the default when text lacks formatting; better: layer-cake (scan headings), front-load key info, informative heading starts, bullets, bold key words. https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/

---

## 2. Content that wins

- **Expert** Laszlo Bock (then Google SVP People Ops), LinkedIn post Sept 2014: "Accomplished [X] as measured by [Y], by doing [Z]". Copy: https://www.calstatela.edu/sites/default/files/formula_for_a_winning_resume.docx ; Inc.: https://www.inc.com/bill-murphy-jr/google-recruiters-say-these-5-resume-tips-including-x-y-z-formula-will-improve-your-odds-of-getting-hired-at-google.html ; Quartz: https://qz.com/201088/google-just-revealed-the-incredibly-simple-formula-for-killer-resumes
- **Expert** Orosz, freeCodeCamp 2020-11-13: same formula; quantify (team size, coverage, SLA, revenue, users, installs, ratings); active verbs; techs at end of each entry; tailor; plain single-column template; restrained bold; link one or two specific articles, not a blog homepage; keep READMEs clean. https://www.freecodecamp.org/news/how-to-write-a-developer-resume-recruiters-will-read/
- **Expert** Orosz (SO blog 2020): experienced order = current role/title, languages/technologies, education, talks/patents/publications, standout OSS; side projects "rarely weigh more" than work experience; separate dates/position/company so they scan; skills list without proficiency levels, or tools woven into each role. US: one page for a few years' experience; Europe often two.
- **Expert** Gayle Laakmann McDowell (2013): "Your resume needs to be accomplishment-oriented"; "I already know what your responsibilities were because I know your job title"; cares about what *you* did. https://www.gayle.com/blog/2013/04/04/how-to-make-your-resume-bullets-jump ; Dice version: https://www.dice.com/career-advice/how-to-make-your-resume-bullets-jump
- **Expert** Yangshun Tay (ex-Meta Staff Eng), Tech Interview Handbook, updated 2026-08-07: one page; summary <50 words, headline <10 words; education first if <3 yrs experience; plain-text skills; never work email/phone; LinkedIn must-have; GitHub/personal site good-to-have. https://www.techinterviewhandbook.org/resume/
- **Expert** McDonald/Kim 2026: "Lead with results, not activities"; quantify scope (%, users, latency); strongest bullet first; leadership signals without title; technologies inside bullets; 2–3 sentence summary, "Don't let AI write your summary"; only list skills you can discuss; GitHub only if deployed/documented; personal site only if high quality; projects marginal except new grads/new area.
- **Expert** Swizec 2026: scope + upward progression; transferable metrics; vague jargon ("delivered technical solutions to client problems") and inflated project claims are easy to spot.
- **Expert (via secondary summary)** Lee Robinson, VP Eng at Cursor, X post ~May 2026: one page — "If you have more to share, publish it on your personal site and link out"; a thoughtful personal site sets you apart, a generic/AI-looking one hurts; quality over quantity of projects; show real AI-tool usage in workflow. https://www.explainthis.io/en/career/cursor-vp-resume-tips (original: https://x.com/leerob/status/2053287286226166254, not read directly)

### Promotions / progression within one company
- **Expert** Holloway (above) and Swizec (above): progression is among the strongest positive signals.
- Formatting: résumé-builder sites (vendor, low authority) converge on stacking titles under one employer header with separate date ranges when the role is a progression; separate entries when scope changed a lot. e.g. https://www.themuse.com/advice/2-jobs-1-company-how-to-show-multiple-positions-on-your-resume ; https://www.topresume.com/career-advice/how-to-format-your-resume-for-multiple-jobs-at-one-company
- Bank titles: **Anecdote** (Blind, eFinancialCareers 2024) — bank corporate titles (Analyst/Associate/AVP/VP) map inconsistently to tech levels; some engineers swap in functional titles for tech-company audiences. https://www.efinancialcareers.com/news/2024/01/software-engineer-vp-in-banking ; https://www.levels.fyi/community/thread/qf5562/why-do-banks-like-goldman-sachs-call-l5-engineers-vps

### Side ventures / founder projects
- **Expert** Holloway: side projects count when they gain recognition or significant use; "Has this person started a business before?" shows up as business impact in project descriptions; entrepreneurial focus helps senior roles/smaller companies.
- **Anecdote** HN "Can adding an ongoing side business (SaaS) on my resume hurt me?" 2023-01-09: employers mostly positive ("I would treat it as a major positive" — bruce511; "a serious project… would significantly outweigh any concerns" — capitalsigma); caveat about not using company time/resources (shagie). https://news.ycombinator.com/item?id=34305513
- **Anecdote** recruiter blog claim that 8–9 of 10 employers see a recent personal business as flight risk (unmeasured). Surfaced in search: https://thechangelaboratory.squarespace.com/blog/hr-uncovered-do-you-have-a-side-business
- Employer policy context: Infosys allowed outside gig work "with prior consent" (Oct 2022); Wipro fired 300 for moonlighting for competitors (2022). https://www.businesstoday.in/latest/corporate/story/infosys-permits-employees-to-take-up-gig-work-with-prior-consent-from-managers-350464-2022-10-20 ; https://www.freepressjournal.in/business/wipros-rishad-premji-says-300-employees-were-found-working-for-rivals-to-justify-his-tweet-against-moonlighting . Banks commonly require pre-approval for outside business/roles (e.g. Bank of England staff policy: https://www.bankofengland.co.uk/about/governance-and-funding/staff-codes-and-policies/other-employment ; Indian PSU bank conduct rules: https://financialservices.gov.in/beta/sites/default/files/2022-10/Bank%20of%20India%20Officer%20Employees%20(Conduct)%20Regulations,%201976.pdf ). Not the candidate's employer — they must check their own code of conduct.

### Publications
- No hard data. **Expert** Orosz places talks/patents/publications after education for experienced engineers. **Anecdote** (Blind) papers show initiative/communication. https://www.teamblind.com/article/Does-it-make-sense-to-put-research-publications-on-a-resume-while-applying-for-an-unrelated-software-engineer-role-82uCF87m ; **Expert** Wheeler values solo-authored papers as proof.

### Open source / GitHub
- **Expert** Holloway: GitHub useful early when candidate has a lot of public code; most engineers don't — don't expect it. https://holloway.com/g/technical-recruiting-hiring/sections/linkedin-github-and-personal-websites
- **Anecdote** HN "What do recruiters look for in a GitHub profile?" 2019-03-17: "I glance at it and take a brief look at anything interesting" (Edd314159); "I will never, ever penalise a candidate for an empty GitHub profile" (Edd314159); "I penalize people slightly for an empty GitHub if they put it on their resume" (travisjungroth); good README valued (gherlein). https://news.ycombinator.com/item?id=19413348
- **Data** HackerRank 2018 tech recruiting research (vendor): strong work experience is the top qualification; 81% of HMs rely on résumés at first stage. https://sdtimes.com/devexec/job-seeking-developers-skills-outweigh-resume/

---

## 3. What to cut / red flags

- Skill-rating bars: Orosz says list without proficiency levels (SO blog 2020). Others are career blogs (low authority): https://dev.to/tim012432/do-not-put-skill-bars-on-your-resume-lh6 ; https://www.hiration.com/blog/skill-bars-resume/ ; ATS parsing loses ratings.
- Objective statements: not endorsed by any expert source found; experts favour a short tailored summary (Ladders 2018 "overview"; McDonald 2–3 sentences; Tech Interview Handbook <50 words). Generic/AI-written summaries criticised (McDonald; Robinson).
- Buzzwords/vague claims: McDonald ("buzzwords, zero-impact activity descriptions, and walls of text"); Swizec ("delivered technical solutions…"); Orosz ("widely adopted by the company" without specifics).
- Photos: Orosz "You won't want to add a photo on your resume"; McDonald lists photo, age, full address, hobbies, "references available" as minimise; Ladders 2012: photos on LinkedIn took 19% of gaze and may bias.
- Long paragraphs/multi-column clutter: Ladders 2018 worst performers.
- Gaps: McDonald suggests year-only dates to hide intra-year gaps (Expert; ethically arguable). Not relevant to this candidate.
- Inflated titles/fake metrics: Swizec (inflation easy to spot); Wheeler (impact claims easy to embellish; ~half fail a hello-world test); McDonald ("Make bullets defensible"). Holloway: typos strongest negative in Lerner's data.
- Too many links / unprioritised content: Bahmutov 2019 — long, everything-listed résumés "automatic rejection". https://glebbahmutov.com/blog/dont-help-me-say-no/

---

## 4. Web résumé / portfolio sites

- **Data (small, self-selected)** profy.dev survey Aug 2021, "60+" React team leads/recruiters: most would look at a portfolio site; most said no site ≠ lower chances; author: GitHub projects "superior to a personal website. By a lot"; complaints about broken links and over-engineered sites. https://dev.to/profydev/this-survey-among-60-hiring-managers-reveals-don-t-waste-your-time-on-a-react-portfolio-website-17ge (original profy.dev unreachable)
- **Anecdote** HN "Did your personal website help you get hired?" 2024-09-26 (134 pts, 105 comments): "When I am hiring I always look at personal websites if they are available" (flpm); an empty template with a 4-year-old "TODO" "will count against you" (flpm); one says sites show communication ability (ratedgene); one saw employer visits in logs (psyklic); one says employers never looked (blueappconfig); agency flagged a profane project name (btasker). https://news.ycombinator.com/item?id=41656015
- **Expert** Orosz: links not clicked under volume; portfolio helps after the first scan.
- **Expert** McDonald 2026: personal site must be high quality or leave it off.
- **Expert** Robinson 2026: thoughtful site differentiates; generic/AI-looking hurts; one-page résumé + personal site for overflow.
- **Expert** Bahmutov 2019 (screened 1,000+ résumés at Cypress): put GitHub/site under your name; ATS labels links "Website" and they get lost when forwarded; send PDF.
- **Anecdote** r/EngineeringResumes recruiter AMA 2024-03-19: companies train recruiters not to click unfamiliar links except LinkedIn/email (security). https://redlib.andus.dev/r/EngineeringResumes/comments/1biryii/ama_recruiter_and_founder_of_the_headless/kw2xdqm/?context=3 (mirror)
- **Data** (old, employer surveys) CareerBuilder/Harris Poll 2018 (n≈1,012 hiring/HR managers): 66% use search engines to research candidates; 47% less likely to interview a candidate they can't find online (2017 wave: 69% / 57%). https://www.hrdive.com/news/are-employers-moving-away-from-job-candidates-who-lack-an-online-presence/398657 ; https://www.securitymagazine.com/articles/89441-percent-of-employers-check-candidates-social-media-profiles
- PDF expectations: ATS/HR systems want a file; web link is a supplement (career-blog consensus + Bahmutov). e.g. https://cvme-6l8.pages.dev/guides/pdf-vs-website-cv
- Annoyances:
  - **Data/Expert** NN/g "Scrolljacking 101", Sara Paul, 2023-08-06: "scrolljacking leads to more user pain than benefits"; task-focused users most annoyed; worse on mobile; keep important content out of scrolljacks. https://www.nngroup.com/articles/scrolljacking-101/
  - **Expert** NN/g on splash screens: "universally condemned… users' only reaction is to go straight for the 'skip intro' button." https://www.nngroup.com/articles/making-hated-design-elements-work/
  - **Data** (Google/SOASTA 2017, general mobile web): 53% of mobile visits abandoned if load >3 s; bounce probability +113% from 1 s to 7 s. https://thinkwithgoogle.com/consumer-insights/consumer-trends/mobile-site-load-time-statistics/ ; https://www.thinkwithgoogle.com/intl/en-gb/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks
  - **Anecdote** 26-second landing animation (dev.to); ~20% of portfolios have broken elements. https://dev.to/hellnar/5-things-you-should-fix-in-your-portfolio-4b10
- Length: Huntr 2025 (vendor, 1.7M applications) claims 2-page résumés had highest interview rate 3.24% — correlational, own user base. https://huntr.co/blog/Free-Resume-Review-Reddit . Most SWE experts still say one page at <5 yrs.

---

## 5. Discoverability & link previews

- LinkedIn official help: required og:title, og:image, og:description, og:url; image min 1200×627, 1.91:1, ≤5 MB; <401 px wide shows as thumbnail; blocked crawler/protected dir prevents image. https://www.linkedin.com/help/linkedin/answer/46687 . Post Inspector to re-scrape: https://www.linkedin.com/post-inspector/
- WhatsApp: docs reportedly say og:image "should be under 600KB"; practitioners report ~300 KB as safer. https://phabricator.wikimedia.org/T295521 ; https://discuss.flarum.org/d/39207-whatsapp-embed
- Slack: crawls link; uses OG/Twitter tags (whichever first), then meta description (older Slack dev blog); one developer found Slack requests only the first ~32 KB → keep meta tags high in <head>. https://docs.slack.dev/messaging/unfurling-links-in-messages/ ; https://medium.com/slack-developer-blog/e64b4bb9254 ; https://blog.daveallie.com/slack-link-unfurling/
- X/Twitter: card processor checks twitter:* first then falls back to OG; twitter:card has no OG equivalent; summary_large_image. https://dev.twitter.com/cards (legacy) ; secondary: https://frontendchecklist.io/rules/seo/twitter-cards
- Google title links: descriptive concise <title>, main title prominent (first h1), sources include <title>, h1, og:title, anchor text, WebSite structured data. https://developers.google.com/search/docs/appearance/title-link
- Google ProfilePage structured data: for sites where creators share first-hand perspectives; valid uses include "About Me" pages on blogs; required mainEntity Person with name; recommended alternateName, description, identifier, image, sameAs, dateCreated/dateModified; no rich-result guarantee. https://developers.google.com/search/docs/appearance/structured-data/profile-page

---

## 6. India vs US

- Photo: US — off (Orosz; EEOC-related employer caution). India — mixed; modern tech firms generally don't expect one (career blogs; unverified "Indeed India 65%" stat discarded). https://www.kickresume.com/en/blog/should-you-put-your-picture-on-your-resume/ ; https://www.placementpreparation.io/blog/should-you-add-a-photo-in-your-resume/
- Personal details (DOB, father's name, marital status, declaration): obsolete for private/tech roles; still used for government/PSU biodata. https://www.karangupta.com/blog/how-to-write-a-resume-cv-for-international-job-applications-from-india ; https://resumegeni.com/blog/how-to-write-resume-india
- CTC / expected CTC / notice period: entered in Naukri profile fields and application forms; put on a résumé only if the posting asks. https://www.naukri.com/blog/how-to-answer-what-is-your-current-ctc/amp/ ; https://www.naukri.com/faq/recruiter-job-posting — never on a public page (privacy + signals job hunt).
- CGPA: Indian career blogs say it matters less after 1–2 yrs for product companies; strong GPA still worth one line. https://jobrise.io/en/blog/resume-with-low-cgpa-tips/
- Length: US one page at this experience (Orosz, Tech Interview Handbook, McDonald); Europe/India two pages common.
- LinkedIn "Open to Work" recruiters-only: "we take steps to prevent LinkedIn Recruiter users who work at your current company from seeing… but we can't guarantee complete privacy." https://www.linkedin.com/help/linkedin/answer/67405

---

## Raw implications (expanded in final report)
See final message.
