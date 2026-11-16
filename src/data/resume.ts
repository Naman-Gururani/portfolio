/* ============================================================
   THE RÉSUMÉ RECORD — every fact about Naman, in full detail.
   The résumé page at /portfolio/ is rendered from this file at build
   time, and the game's cards (content.ts) take their shared facts
   from it, so the two can never disagree.

   Rules (spec docs/superpowers/specs/2026-11-16-resume-site-design.md,
   §2–§3 and §10):
   - it is about Naman, told in his own casual voice; the job is one
     part of the story, told in full under Experience;
   - facts only from the spec's sources; estimates say so;
   - nothing about graduate applications, tests or target schools;
     saying he is open to new opportunities is wanted;
   - bank detail at "option B": engineering detail, scale as orders of
     magnitude, no internal system / team / project names.
   Text may carry [label](href) links; the renderer turns them into <a>.
   ============================================================ */

export type Link = { label: string; href: string }
/** Dates are 'YYYY-MM' or 'YYYY'; `to: null` means "present". */
export type Role = { title: string; grade?: string; from: string; to: string | null; note?: string }
export type Project = {
  id: string
  name: string
  kicker: string
  when?: string
  role: string
  summary: string
  points: string[]
  stack: string[]
  links: Link[]
  size: 'lg' | 'md'
}
export type Metric = { value: string; label: string }
export type Chapter = {
  id: string
  /** What the year rail and the chapter's date line say. */
  rail: string
  when: string
  /** Machine-readable start, for <time>; left out when no source dates it. */
  datetime?: string
  role: string
  title: string
  lead: string
  metrics: Metric[]
  hard?: string[]
  points: string[]
  outcome?: string
  tags: string[]
}
export type Activity = { what: string; where: string; when: string; detail?: string }
export type Post = { title: string; href: string; date: string; description: string; tags: string[] }

const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.enlacey.app'

export const PERSON = {
  name: 'Naman Gururani',
  title: 'Data & Backend Engineer',
  employer: 'Barclays',
  location: 'India',
  home: 'Haldwani',
  email: 'gururaninaman@gmail.com',
  github: 'https://github.com/Naman-Gururani',
  githubHandle: 'Naman-Gururani',
  linkedin: 'https://www.linkedin.com/in/naman-gururani',
  linkedinHandle: 'in/naman-gururani',
  site: 'https://naman-gururani.github.io/',
  blog: 'https://naman-gururani.github.io/blog/',
  kicker: 'Software engineer from Haldwani',
  hello: 'hi, I’m Naman',
  headline: ['I like solving problems,', 'and I like building', 'things people use.'],
  story: [
    'I’m a software engineer from Haldwani, and I love writing code. Mostly I love the bit before it works, when a problem is still a mess and I get to figure it out.',
    'My day job is at Barclays. I work on the backend that tracks payments in real time.',
    `The rest of the time I build my own things. Back home there’s always a guy who knows a guy, so I built [Enlacey](${PLAY_STORE}), an app that finds you that guy. It’s live on Google Play.`,
    'I also turned this résumé into a little [pixel-art game](/portfolio/play/), for anyone who’d rather play than read.',
  ],
  connect: 'If you’re building something of your own, or want to, I’d love to hear about it. I’m also open to new opportunities, so if you have one, email me.',
  openTo: ['backend', 'data', 'full-stack'],
  interests: [
    'Building apps end to end',
    'Backend & system design',
    'Problem solving',
    'Hackathons',
    'Starting something of my own',
    'Open source',
    'The gym',
  ],
} as const

/** The credential on the hero: only what a reader actually wants to know. */
export const CARD = {
  studied: { school: 'SRM Institute of Science and Technology', detail: 'B.Tech CSE · CGPA 9.63 / 10' },
  building: { label: 'Enlacey', href: PLAY_STORE, detail: 'live on Google Play' },
  openSource: { label: '3 PRs merged', href: '#p-oss', detail: 'Conductor · Docling' },
} as const

/** The Barclays roles, newest first. The game's cards read these. */
export const EXPERIENCE: { employer: string; place: string; roles: Role[] } = {
  employer: 'Barclays',
  place: 'India',
  roles: [
    { title: 'Data & Backend Engineer', grade: 'BA4', from: '2025', to: null, note: 'Promoted from BA3 to BA4' },
    { title: 'Data & Backend Engineer', grade: 'BA3', from: '2024-08', to: '2025', note: 'Full time, after the internship' },
    { title: 'DevOps Intern', from: '2023-06', to: '2023-08', note: 'Converted to a full-time offer' },
  ],
}

/** "Barclays, so far": the chapters that open as the reader scrolls. */
export const JOURNEY: Chapter[] = [
  {
    id: 'ch-intern',
    rail: '2023',
    when: 'Jun – Aug 2023',
    datetime: '2023-06',
    role: 'DevOps Intern · Barclays Global Service Center',
    title: 'My internship: an 8-hour wait down to real time',
    lead: 'Analysts were waiting up to 8 hours for process exceptions to reach their portal. I automated the whole path behind it.',
    metrics: [{ value: '8 h → live', label: 'how long analysts waited' }],
    points: [
      'Python and KornShell (KSH) scripts aggregate the exception data from Teradata tables into an organised format.',
      'An integration with the portal’s REST API loads it, so exceptions now show up in real time.',
      'OAuth 2.0 authentication secures the connection to the API, so sending requests and receiving responses is automated.',
    ],
    outcome: 'The internship turned into a full-time offer.',
    tags: ['Python', 'KornShell', 'Teradata', 'REST API', 'OAuth 2.0'],
  },
  {
    id: 'ch-platform',
    rail: '2024–25',
    when: 'Aug 2024 – 2025',
    datetime: '2024-08',
    role: 'Data & Backend Engineer · full time',
    title: 'Building a platform from day one',
    lead: 'My team was set up to move the bank’s corporate payments data off a legacy batch stack and onto one real-time platform in Java, and I was one of its first developers. Streaming was new to all of us, and it’s harder than batch: you can’t rerun a stream overnight, so it has to recover from a failure without losing or doubling a payment.',
    metrics: [],
    points: [
      'My proof-of-concept Flink and Kafka Streams code became the template the team built its services on.',
      'My first big delivery was tokenising sensitive customer data in UK payment flows. Then I built the jurisdiction controls that decide where payment data may be processed.',
      'I set up dashboards and alerts on ELK and Snowflake that flag a service going down or using too much, and wrote the 60-step start-of-day checklist and the alert runbooks.',
      'Some bugs took real digging. A cache connection that dropped about once an hour turned out to be credentials rotating three layers down.',
      'The stack was new to the whole team, so I ran sessions on Java and streaming for colleagues moving over from the old platform.',
    ],
    outcome: 'Promoted from BA3 to BA4 in 2025.',
    tags: ['Java', 'Spring Boot', 'Kafka', 'Kafka Streams', 'Flink', 'ELK', 'Snowflake', 'AWS'],
  },
  {
    id: 'ch-lineage',
    rail: '2026',
    when: '2026',
    datetime: '2026',
    role: 'Data & Backend Engineer · BA4',
    title: 'The payment lineage engine',
    lead: 'Our platform takes payment data from about 20 source systems, and each one records a payment under its own ID. The lineage engine works out, live, which events belong to the same payment and rebuilds its whole journey. Showing that path is the main point of our platform: it’s built so clients and other teams can see where a payment went, and so the payments team can trace its whole life cycle in an incident, to fix the problem or prove nothing was lost. I designed it from a blank page, and I own it end to end.',
    metrics: [
      { value: '~20', label: 'source systems, by design' },
      { value: '100s of millions', label: 'events a day, by design' },
    ],
    hard: [
      'Events arrive out of order, and some arrive late.',
      'Two chains that looked unrelated can turn out to be one payment, and they have to be merged while new events keep coming in.',
      'One bad write corrupts a payment’s history.',
    ],
    points: [
      'Union-find groups related events, so chains can merge cleanly.',
      'Lua scripts update the live state in Redis atomically, and distributed locks guard every merge.',
      'A second tier on DynamoDB keeps what outlives the in-memory store.',
      'I gathered the requirements from several business analysts, built the cost model for approval, and ran system and performance testing with two partner teams.',
      'This year I also built a connector that brings ISO 20022 payment messages from IBM MQ into Kafka. The framework team reused it as the base for their generic version.',
    ],
    tags: ['Flink', 'Kafka', 'Redis', 'Lua', 'DynamoDB', 'IBM MQ', 'ISO 20022'],
  },
  {
    id: 'ch-hackathon',
    rail: 'Hackathon',
    when: 'Along the way',
    role: 'Internal hackathon · team entry',
    title: 'A loan-rollover prototype in 24 hours',
    lead: 'Another team was rolling over loans and their interest payments by hand. In the bank’s internal hackathon, my team built a working prototype that does it automatically. We didn’t win, but that team’s director plans to use the idea.',
    metrics: [
      { value: '~95%', label: 'faster rollovers (estimate)' },
      { value: '~2,000 h', label: 'manual work saved a month (estimate)' },
    ],
    points: [],
    tags: [],
  },
]

export const PROJECTS: Project[] = [
  {
    id: 'enlacey',
    name: 'Enlacey',
    kicker: 'MY STARTUP · LIVE ON GOOGLE PLAY',
    when: '2026',
    role: 'Founder. I run the product and operations, sign up the first providers and approve every change; Claude Code writes most of the code.',
    summary:
      'Post what you need, a plumber, a cook, an electrician, and verified people nearby accept the job or send a quote. It’s been live on Google Play since October 2026, starting in Haldwani, and it’s coming soon to iPhone.',
    points: [
      'A job goes out to many providers at once, and exactly one gets it. Every write that touches a job locks its row first, so two people tapping Accept at the same moment can’t both win.',
      'Search handles Hindi, English and the mix of the two people actually type, typos included, all inside Postgres.',
      'Providers get verified in steps, from phone number to background check, and online payments stay switched off until the paperwork is done.',
      'The whole app works in English and in Hindi.',
    ],
    stack: ['TypeScript', 'NestJS', 'PostgreSQL · PostGIS · pgvector', 'Redis · BullMQ', 'Expo · React Native', 'Next.js', 'AWS'],
    links: [
      { label: 'Google Play', href: PLAY_STORE },
      { label: 'enlacey.com', href: 'https://enlacey.com' },
    ],
    size: 'lg',
  },
  {
    id: 'oss',
    name: 'Open source',
    kicker: '3 PRS MERGED',
    when: '2026',
    role: 'Contributor',
    summary: 'I like fixing things in tools other people depend on. Three of my pull requests have been merged so far.',
    points: [
      'Conductor: swapped a regex that could hang on crafted input for a linear scanner, closing a high-severity security alert. Shipped in v3.32.5.',
      'Docling Java: the client’s async calls can now run on your own Executor. Shipped in v0.7.0.',
      'Docling: LaTeX conversion now keeps the spacing and paragraphs around inline macros.',
    ],
    stack: ['Java', 'Python'],
    links: [
      { label: 'Conductor #1654', href: 'https://github.com/conductor-oss/conductor/pull/1654' },
      { label: 'Docling Java #691', href: 'https://github.com/docling-project/docling-java/pull/691' },
      { label: 'Docling #4340', href: 'https://github.com/docling-project/docling/pull/4340' },
    ],
    size: 'md',
  },
  {
    id: 'fair',
    name: 'Naman’s World Fair',
    kicker: 'THIS RÉSUMÉ, AS A GAME',
    when: '2026',
    role: 'Designed and directed it; built spec-first with Claude Code',
    summary:
      'A pixel-art fairground: win a Wordle ticket at the gate, ride my career on a rollercoaster and pull projects out of a claw machine. Every game has a skip button, because nobody should need to be good at games to read a résumé.',
    points: ['About 1,200 automated tests, in strict TypeScript.', 'Works on phones, with a guided walk to every attraction.'],
    stack: ['TypeScript', 'Phaser 3', 'Vite', 'Vitest'],
    links: [
      { label: 'Play it', href: '/portfolio/play/' },
      { label: 'Source', href: 'https://github.com/Naman-Gururani/portfolio' },
    ],
    size: 'md',
  },
  {
    id: 'healthcare',
    name: 'Healthcare Assistance (AI/ML)',
    kicker: 'FINAL-YEAR PROJECT · PAPER',
    role: 'Team lead, supervised by Ms. Anjali Malik',
    summary:
      'A system that helps doctors make decisions with machine learning. It was my final-year project, and we wrote it up as a paper with my supervisor.',
    points: [
      'Validated the model with cross-validation on held-out data.',
      'Meant as a second opinion for doctors.',
      'Graded O, the top grade. My teammates picked me to lead again after our minor project.',
    ],
    stack: ['Python', 'Machine learning'],
    links: [],
    size: 'md',
  },
  {
    id: 'safestride',
    name: 'Safe Stride',
    kicker: 'PROJECT · SHIPPED',
    role: 'Built it',
    summary:
      'A safety app for elderly people. It tracks location in real time, spots falls with the phone’s accelerometer and sends an SOS to emergency services on its own.',
    points: ['Location tracking, fall detection, automatic SOS and a live map, in one app.'],
    stack: ['Geolocation', 'Sensors', 'Twilio', 'Leaflet'],
    links: [{ label: 'GitHub', href: 'https://github.com/Naman-Gururani/Safe-Stride' }],
    size: 'md',
  },
  {
    id: 'flight',
    name: 'Flight Delay Predictor',
    kicker: 'MINOR PROJECT',
    role: 'Team lead, guided by Ms. Anjali Malik',
    summary: 'My minor project: a machine-learning model that predicts flight delays. I led the team, and it was graded O.',
    points: [],
    stack: ['Python', 'Machine learning'],
    links: [],
    size: 'md',
  },
]

export const EDUCATION = {
  school: 'SRM Institute of Science and Technology',
  campus: 'Delhi-NCR campus',
  degree: 'B.Tech, Computer Science and Engineering',
  from: '2020',
  to: '2024',
  completed: 'May 2024',
  cgpa: '9.63 / 10',
  sgpa: 'SGPA 10.00 / 10 in two semesters',
  rank: 'Among the top 5% of rank holders in the B.Tech CSE programme, batch 2020–2024 (4,000+ students across all branches)',
  rankSource: 'Certified by the university’s Controller of Examinations',
  courses: [{ name: 'Database Management Systems', grade: 'O' }],
} as const

export const PUBLICATION = {
  title: 'Healthcare Assistance Using AIML',
  with: 'Ms. Anjali Malik, SRM Institute of Science and Technology',
  note: 'Written up from the final-year project I led: a system that helps doctors make decisions, validated with cross-validation on held-out data.',
} as const

export const COURSEWORK: string[] = [
  'Data Structures and Algorithms (DSA)',
  'Operating System (OS)',
  'Design and Analysis of Algorithms (DAA)',
  'Database Management System (DBMS)',
  'Computer Network (CN)',
  'Software Engineering and Project Management (SEPM)',
  'Object Oriented Programming (OOPS)',
  'Artificial Intelligence (AI)',
  'Network Security (NS)',
  'Advanced Programming Practices (APP)',
]

export const ACTIVITIES: Activity[] = [
  {
    what: 'Class representative',
    where: 'B.Tech CSE, SRM IST',
    when: 'B.Tech',
    detail: 'The go-between for my section and the faculty.',
  },
  {
    what: 'Technical core team',
    where: 'GeeksforGeeks student chapter, SRM IST',
    when: '2022–2024',
    detail: 'Ran club events.',
  },
  {
    what: 'Core team, management',
    where: 'Computer Society of India student chapter, SRM IST',
    when: '2021–2022',
  },
  {
    what: 'InnoHacks 2.0',
    where: 'KIET Group of Institutions, Ghaziabad',
    when: 'Apr 2023',
    detail: 'A 24-hour in-person hackathon. Ours was the only team from SRM.',
  },
  {
    what: 'Smart India Hackathon',
    where: 'India’s national student hackathon',
    when: 'B.Tech',
    detail: 'Took part with a team from SRM.',
  },
  {
    what: 'Project lead, twice',
    where: 'Minor and major projects, SRM IST',
    when: 'B.Tech',
    detail: 'Both graded O; the major project became the paper.',
  },
]

export const SKILLS: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['Java', 'Python', 'TypeScript', 'SQL', 'C++'] },
  { label: 'Streaming', items: ['Apache Kafka', 'Kafka Streams', 'Apache Flink', 'IBM MQ'] },
  { label: 'Data', items: ['Redis', 'DynamoDB', 'PostgreSQL', 'Snowflake', 'Teradata'] },
  { label: 'Backend & platform', items: ['Spring Boot', 'NestJS', 'AWS', 'Docker', 'Linux', 'ELK', 'Git'] },
  { label: 'How I work', items: ['Spec-first design', 'AI-assisted development'] },
]

export const POSTS: Post[] = [
  {
    title: 'Building a portfolio you can walk around',
    href: 'https://naman-gururani.github.io/blog/building-a-portfolio-thats-a-game/',
    date: '2026-09-01',
    description: 'Why my portfolio is a pixel-art world built with Phaser, and what one palette, a day/night cycle and a Skip button taught me about shipping.',
    tags: ['phaser', 'typescript', 'design'],
  },
]

export const UPDATED = 'Nov 2026'
