// A public page Naman's manager can open must never talk about applications,
// tests or target schools (spec §2). One regex, shared by every résumé test.
export const BANNED =
  /IELTS|TOEFL|\bGRE\b|admission|applying|application|Cornell|Carnegie|Berkeley|Toronto|Waterloo|Georgia Tech|UIUC|open to work|seeking|hire me|prospective/i
