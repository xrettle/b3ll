export type Theme = 'dark' | 'light' | 'slate-blue' | 'rose-red' | 'sunset-orange' | 'forest-green' | 'violet-purple';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  muted: string;
  border: string;
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    primary: '#1a1a1a',
    secondary: '#2d2d2d',
    background: '#000000',
    text: '#ffffff',
    accent: '#3b82f6',
    muted: '#4b5563',
    border: '#374151',
  },
  light: {
    primary: '#ffffff',
    secondary: '#f3f4f6',
    background: '#f9fafb',
    text: '#111827',
    accent: '#2563eb',
    muted: '#9ca3af',
    border: '#e5e7eb',
  },
  'slate-blue': {
    primary: '#1e293b',
    secondary: '#334155',
    background: '#0f172a',
    text: '#f8fafc',
    accent: '#3b82f6',
    muted: '#64748b',
    border: '#475569',
  },
  'rose-red': {
    primary: '#881337',
    secondary: '#be185d',
    background: '#4c0519',
    text: '#fdf2f8',
    accent: '#ec4899',
    muted: '#be185d',
    border: '#be185d',
  },
  'sunset-orange': {
    primary: '#c2410c',
    secondary: '#ea580c',
    background: '#7c2d12',
    text: '#fff7ed',
    accent: '#f97316',
    muted: '#ea580c',
    border: '#ea580c',
  },
  'forest-green': {
    primary: '#14532d',
    secondary: '#166534',
    background: '#052e16',
    text: '#f0fdf4',
    accent: '#22c55e',
    muted: '#16a34a',
    border: '#16a34a',
  },
  'violet-purple': {
    primary: '#581c87',
    secondary: '#7e22ce',
    background: '#2e1065',
    text: '#faf5ff',
    accent: '#a855f7',
    muted: '#9333ea',
    border: '#9333ea',
  },
}; 