export type AccentColorKey = 'silver' | 'amber' | 'slate' | 'ocean' | 'emerald' | 'rose' | 'violet';

export interface AccentTheme {
  name: string;
  key: AccentColorKey;
  darkColor: string;
  lightColor: string;
  darkActiveBg: string;
  lightActiveBg: string;
  darkBorder: string;
  lightBorder: string;
  ringClass: string;
  badgeBgDark: string;
  badgeBgLight: string;
}

export const ACCENT_PALETTES: Record<AccentColorKey, AccentTheme> = {
  silver: {
    name: 'Native Silver',
    key: 'silver',
    darkColor: '#E2E8F0', // Crisp silver platinum
    lightColor: '#334155', // Rich graphite silver
    darkActiveBg: 'rgba(255, 255, 255, 0.08)',
    lightActiveBg: 'rgba(0, 0, 0, 0.06)',
    darkBorder: 'rgba(255, 255, 255, 0.15)',
    lightBorder: 'rgba(0, 0, 0, 0.12)',
    ringClass: 'ring-slate-400',
    badgeBgDark: 'bg-slate-700/60 text-slate-200',
    badgeBgLight: 'bg-slate-200 text-slate-700'
  },
  amber: {
    name: 'Classic Gold / Amber',
    key: 'amber',
    darkColor: '#F59E0B',
    lightColor: '#D97706',
    darkActiveBg: 'rgba(245, 158, 11, 0.15)',
    lightActiveBg: 'rgba(217, 119, 6, 0.12)',
    darkBorder: 'rgba(245, 158, 11, 0.35)',
    lightBorder: 'rgba(217, 119, 6, 0.35)',
    ringClass: 'ring-amber-500',
    badgeBgDark: 'bg-amber-900/60 text-amber-300',
    badgeBgLight: 'bg-amber-100 text-amber-800'
  },
  slate: {
    name: 'Graphite / Titanium',
    key: 'slate',
    darkColor: '#94A3B8',
    lightColor: '#475569',
    darkActiveBg: 'rgba(148, 163, 184, 0.12)',
    lightActiveBg: 'rgba(71, 85, 105, 0.1)',
    darkBorder: 'rgba(148, 163, 184, 0.25)',
    lightBorder: 'rgba(71, 85, 105, 0.2)',
    ringClass: 'ring-slate-500',
    badgeBgDark: 'bg-slate-800 text-slate-300',
    badgeBgLight: 'bg-slate-200 text-slate-800'
  },
  ocean: {
    name: 'Deep Blue',
    key: 'ocean',
    darkColor: '#38BDF8',
    lightColor: '#0284C7',
    darkActiveBg: 'rgba(56, 189, 248, 0.14)',
    lightActiveBg: 'rgba(2, 132, 199, 0.1)',
    darkBorder: 'rgba(56, 189, 248, 0.3)',
    lightBorder: 'rgba(2, 132, 199, 0.25)',
    ringClass: 'ring-sky-500',
    badgeBgDark: 'bg-sky-950 text-sky-300',
    badgeBgLight: 'bg-sky-100 text-sky-800'
  },
  emerald: {
    name: 'Sage Emerald',
    key: 'emerald',
    darkColor: '#34D399',
    lightColor: '#059669',
    darkActiveBg: 'rgba(52, 211, 153, 0.14)',
    lightActiveBg: 'rgba(5, 150, 105, 0.1)',
    darkBorder: 'rgba(52, 211, 153, 0.3)',
    lightBorder: 'rgba(5, 150, 105, 0.25)',
    ringClass: 'ring-emerald-500',
    badgeBgDark: 'bg-emerald-950 text-emerald-300',
    badgeBgLight: 'bg-emerald-100 text-emerald-800'
  },
  rose: {
    name: 'Apple Rose',
    key: 'rose',
    darkColor: '#FB7185',
    lightColor: '#E11D48',
    darkActiveBg: 'rgba(251, 113, 133, 0.14)',
    lightActiveBg: 'rgba(225, 29, 72, 0.1)',
    darkBorder: 'rgba(251, 113, 133, 0.3)',
    lightBorder: 'rgba(225, 29, 72, 0.25)',
    ringClass: 'ring-rose-500',
    badgeBgDark: 'bg-rose-950 text-rose-300',
    badgeBgLight: 'bg-rose-100 text-rose-800'
  },
  violet: {
    name: 'Midnight Purple',
    key: 'violet',
    darkColor: '#C084FC',
    lightColor: '#7C3AED',
    darkActiveBg: 'rgba(192, 132, 252, 0.14)',
    lightActiveBg: 'rgba(124, 58, 237, 0.1)',
    darkBorder: 'rgba(192, 132, 252, 0.3)',
    lightBorder: 'rgba(124, 58, 237, 0.25)',
    ringClass: 'ring-purple-500',
    badgeBgDark: 'bg-purple-950 text-purple-300',
    badgeBgLight: 'bg-purple-100 text-purple-800'
  }
};
