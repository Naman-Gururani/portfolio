/* ============================================================
   THE RÉSUMÉ RECORD — every fact about Naman, in full detail.
   The résumé page at /portfolio/ is rendered from this file at build
   time, and the game's cards (content.ts) take their shared facts
   from it, so the two can never disagree.

   Rules (spec docs/superpowers/specs/2026-11-16-resume-site-design.md):
   - facts only from the spec's §3 sources; nothing estimated is shown
     without saying so;
   - public page: nothing about applications, tests or target schools;
   - bank detail at "option B": engineering detail, scale as orders of
     magnitude, no internal system / team / project names.
   ============================================================ */

export type Link = { label: string; href: string }
/** Dates are 'YYYY-MM' or 'YYYY'; `to: null` means "present". */
export type Role = { title: string; grade?: string; from: string; to: string | null; note?: string }
export type Bullet = { lead: string; text: string; how?: string[]; tags?: string[] }
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
export type Metric = { value: string; unit: string; label: string; basis: string }
export type Activity = { what: string; where: string; when: string; detail?: string }
export type Post = { title: string; href: string; date: string }

export const PERSON = {
  name: 'Naman Gururani',
  title: 'Data and Backend Engineer',
  employer: 'Barclays',
  location: 'India',
  email: 'gururaninaman@gmail.com',
  github: 'https://github.com/Naman-Gururani',
  githubHandle: 'Naman-Gururani',
  linkedin: 'https://www.linkedin.com/in/naman-gururani',
  linkedinHandle: 'in/naman-gururani',
  site: 'https://naman-gururani.github.io/',
  blog: 'https://naman-gururani.github.io/blog/',
  headline: ['I build the real-time systems', 'that make payment data', 'trustworthy.'],
  summary:
    'Real-time payment data at Barclays, in Java, Kafka and Flink. B.Tech CSE with a CGPA of 9.63 / 10, among the top 5% of rank holders in my batch. Co-author of a paper on AI-assisted healthcare. Founder of Enlacey, live on Google Play.',
  about: [
    'I work at the layer where money becomes data: real-time streams from payment systems, turned into records a bank can trust.',
    'Since joining Barclays as an intern in 2023, I have gone from writing my team’s first streaming services to owning its payment lineage engine end to end.',
    'Outside work I build Enlacey, a local-services marketplace now live on Google Play, and I write about the systems I build.',
  ],
  openTo: ['Backend', 'Data', 'Java', 'Full-stack', 'Spec-driven development'],
  interests: ['Stream processing', 'Data lineage and correctness', 'Distributed systems', 'Two-sided marketplaces'],
} as const

export const METRICS: Metric[] = [
  {
    value: '~20',
    unit: 'source systems',
    label: 'one payment traced across all of them',
    basis: 'The lineage engine I own matches each payment’s events across about 20 upstream systems, in real time.',
  },
  {
    value: '100s of M',
    unit: 'events a day',
    label: 'the scale the engine is designed for',
    basis: 'Designed and performance-tested for hundreds of millions of payment events a day.',
  },
  {
    value: '8 h → live',
    unit: 'as an intern',
    label: 'a daily delay turned real time',
    basis: 'My internship automation replaced an 8-hour wait for process exceptions with a real-time feed.',
  },
  {
    value: '~95%',
    unit: 'faster, estimated',
    label: 'loan rollovers, in a 24-hour prototype',
    basis: 'Internal hackathon estimate: about 2,000 manual hours a month saved. The owning team plans to adopt it.',
  },
]

export const EXPERIENCE: { employer: string; place: string; roles: Role[]; bullets: Bullet[] } = {
  employer: 'Barclays',
  place: 'India',
  roles: [
    { title: 'Data and Backend Engineer', grade: 'BA4', from: '2025', to: null, note: 'Promoted from BA3 to BA4' },
    { title: 'Data and Backend Engineer', grade: 'BA3', from: '2024-08', to: '2025', note: 'Full time, after the internship' },
    { title: 'DevOps Intern', from: '2023-06', to: '2023-08', note: 'Converted to a full-time offer' },
  ],
  bullets: [
    {
      lead: 'Designed and own the payment lineage engine, end to end.',
      text: 'Different systems record the same corporate payment under their own identifiers; the engine works out, in real time, which events belong together and rebuilds each payment’s full journey across about 20 source systems. I gathered its requirements from several business analysts, built its cost model and took it through system and performance testing with two partner teams.',
      how: [
        'Union-find groups related events, so chains that looked unrelated can be merged while new events keep arriving.',
        'Lua scripts update live state in Redis atomically; distributed locks guard every merge.',
        'A second tier on DynamoDB backs the live state held in Redis.',
        'Designed for hundreds of millions of events a day.',
      ],
      tags: ['Flink', 'Kafka', 'Redis', 'DynamoDB'],
    },
    {
      lead: 'One of the first developers on the move to real-time streaming.',
      text: 'The team was set up to move corporate-payments data off a legacy batch ETL stack onto one real-time Java platform. My proof-of-concept Flink and Kafka Streams code became the template for the team’s new services.',
      tags: ['Java', 'Spring Boot', 'Kafka Streams', 'Flink'],
    },
    {
      lead: 'Built a connector the framework team reused.',
      text: 'It brings ISO 20022 payment messages from IBM MQ into Kafka. The framework team reused it as the base for its generic version.',
      tags: ['IBM MQ', 'Kafka', 'ISO 20022'],
    },
    {
      lead: 'Protected customer data in UK payment flows.',
      text: 'I built the tokenisation of sensitive customer data in UK payment flows, and the jurisdiction controls that decide where payment data may be processed.',
    },
    {
      lead: 'Made the platform easier to run, without being asked.',
      text: 'I set up dashboards and alerts on ELK and Snowflake that flag a service going down or overusing resources, and wrote a 60-step start-of-day checklist and the alert runbooks.',
      tags: ['ELK', 'Snowflake'],
    },
    {
      lead: 'Taught the stack while learning it.',
      text: 'The Java streaming stack was new to the whole team. I helped teammates learn it and ran sessions on Java and the stack for colleagues moving across from the legacy platform.',
    },
    {
      lead: 'Hackathon: loan rollovers, automated in 24 hours.',
      text: 'In the bank’s internal hackathon our team built a working prototype that automates loan rollovers and their interest payments. Estimated effect: rollovers about 95% faster and about 2,000 manual hours a month saved. It did not win; the owning team’s director plans to implement it.',
    },
    {
      lead: 'Internship: an 8-hour delay, made real time.',
      text: 'I automated the loading of process exceptions into an analyst portal through a secured REST API (OAuth 2.0), aggregating Teradata data with Python and KornShell, so analysts saw them as they happened instead of a working day later.',
      tags: ['Python', 'KornShell', 'Teradata', 'OAuth 2.0'],
    },
  ],
}

export const PROJECTS: Project[] = [
  {
    id: 'enlacey',
    name: 'Enlacey',
    kicker: 'FOUNDER · LIVE ON GOOGLE PLAY',
    when: '2026',
    role: 'Founder. I run product, operations and provider onboarding, and design the backend with an AI engineering partner (Claude Code) writing most of the code.',
    summary:
      'An India-first marketplace for local services: post what you need, and verified providers nearby accept the job or send a quote. Live on Google Play since October 2026, launching in Haldwani; coming soon to iPhone.',
    points: [
      'Exactly one provider wins a job sent to many at once: every write that can touch a job takes a row lock on it first, so simultaneous accepts queue instead of colliding.',
      'Hybrid search that mixes keyword and vector matching, so a customer can search in Hindi, English or Hinglish.',
      'Trust is the product: a verification ladder from phone number to background checks, and a payment engine that stays switched off until it is licensed.',
      'English and Hindi at parity across the app; data kept in India on a single cloud region.',
    ],
    stack: ['TypeScript', 'NestJS', 'PostgreSQL · PostGIS · pgvector', 'Redis · BullMQ', 'Expo · React Native', 'Next.js', 'AWS'],
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.enlacey.app' },
      { label: 'enlacey.com', href: 'https://enlacey.com' },
    ],
    size: 'lg',
  },
  {
    id: 'healthcare',
    name: 'Healthcare Assistance (AI/ML)',
    kicker: 'MAJOR PROJECT · CO-AUTHORED PAPER',
    role: 'Team lead, supervised by Ms. Anjali Malik',
    summary:
      'A decision-support system for doctors, built as my final-year major project and written up as a co-authored paper.',
    points: [
      'Validated the model with cross-validation on held-out data.',
      'Framed as support for a doctor’s judgement, never as a diagnosis.',
      'Graded O (outstanding); my teammates chose me to lead again after the minor project.',
    ],
    stack: ['Python', 'Machine learning'],
    links: [],
    size: 'md',
  },
  {
    id: 'fair',
    name: 'Naman’s World Fair',
    kicker: 'THIS RÉSUMÉ, AS A GAME',
    when: '2026',
    role: 'Designed and directed it; built spec-first with Claude Code',
    summary:
      'A pixel-art fairground you can walk around: a Wordle ticket at the gate, my career as a rollercoaster, projects out of a claw machine, and a skip button in every game.',
    points: [
      'About 1,200 automated tests; strict TypeScript throughout.',
      'A Missions sheet and a guided "Take me there" walk for phone players.',
    ],
    stack: ['TypeScript', 'Phaser 3', 'Vite', 'Vitest'],
    links: [
      { label: 'Play it', href: '/portfolio/play/' },
      { label: 'Source', href: 'https://github.com/Naman-Gururani/portfolio' },
    ],
    size: 'md',
  },
  {
    id: 'safestride',
    name: 'Safe Stride',
    kicker: 'PROJECT · SHIPPED',
    role: 'Built it',
    summary: 'A one-stop safety solution for the elderly.',
    points: [
      'Real-time location tracking plus accelerometer-based fall detection.',
      'Automatic SOS to emergency services, with a live map view.',
    ],
    stack: ['Geolocation', 'Sensors', 'Twilio', 'Leaflet'],
    links: [{ label: 'GitHub', href: 'https://github.com/Naman-Gururani/Safe-Stride' }],
    size: 'md',
  },
  {
    id: 'flight',
    name: 'Flight Delay Predictor',
    kicker: 'MINOR PROJECT',
    role: 'Team lead, guided by Ms. Anjali Malik',
    summary: 'A machine-learning model that predicts flight delays, built as my minor project.',
    points: ['Graded O (outstanding).'],
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
  rank: 'Among the top 5% of rank holders in the B.Tech CSE programme, batch 2020–2024',
  rankSource: 'Certified by the university’s Controller of Examinations',
  courses: [{ name: 'Database Management Systems', grade: 'O' }],
} as const

export const PUBLICATION = {
  title: 'Healthcare Assistance Using AIML',
  with: 'Ms. Anjali Malik, SRM Institute of Science and Technology',
  note: 'Written up from the final-year major project I led: a decision-support system for doctors, validated with cross-validation on held-out data.',
} as const

export const ACTIVITIES: Activity[] = [
  {
    what: 'Class representative',
    where: 'B.Tech CSE, SRM IST',
    when: 'B.Tech',
    detail: 'Coordinated between my section and the faculty.',
  },
  {
    what: 'Technical core team',
    where: 'GeeksforGeeks student chapter, SRM IST',
    when: '2022–2024',
    detail: 'Led club events.',
  },
  {
    what: 'Core team, management',
    where: 'Computer Society of India student chapter, SRM IST',
    when: '2021–2022',
  },
  {
    what: 'Hackathons',
    where: 'KIET Group of Institutions hackathon · Smart India Hackathon',
    when: 'B.Tech',
    detail: 'At KIET, ours was the only team from SRM.',
  },
  {
    what: 'Project lead, twice',
    where: 'Minor and major projects, SRM IST',
    when: 'B.Tech',
    detail: 'Both graded O; the major project became the paper.',
  },
]

export const SKILLS: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['Java', 'Python', 'SQL', 'C++'] },
  { label: 'Streaming', items: ['Apache Kafka', 'Kafka Streams', 'Apache Flink', 'IBM MQ'] },
  { label: 'Data', items: ['Redis', 'DynamoDB', 'Snowflake', 'Teradata'] },
  { label: 'Platform', items: ['Spring Boot', 'AWS', 'Docker', 'Linux', 'ELK', 'Git'] },
  { label: 'How I work', items: ['Spec-first design', 'AI-assisted development'] },
]

export const POSTS: Post[] = [
  {
    title: 'Building a portfolio you can walk around',
    href: 'https://naman-gururani.github.io/blog/building-a-portfolio-thats-a-game/',
    date: '2026-09-01',
  },
]

export const UPDATED = 'Nov 2026'
