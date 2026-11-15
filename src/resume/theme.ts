// Two skins. The page opens dark — Naman's choice — whatever the system says,
// and remembers a reader who picks the light one (key `pf.theme`).

export type Theme = 'dark' | 'light'
export const THEME_KEY = 'pf.theme'

export const initialTheme = (stored: string | null): Theme => (stored === 'light' ? 'light' : 'dark')
export const nextTheme = (cur: Theme): Theme => (cur === 'dark' ? 'light' : 'dark')
