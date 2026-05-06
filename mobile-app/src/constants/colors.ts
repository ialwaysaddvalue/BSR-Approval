export const COLORS = {
  // Backgrounds
  bg:       '#f1f5f9',
  card:     '#ffffff',
  navy:     '#0f172a',
  navyMid:  '#1e293b',

  // Text
  text:     '#0f172a',
  muted:    '#64748b',
  light:    '#94a3b8',

  // Borders
  border:   '#e2e8f0',

  // Accents
  amber:    '#f59e0b',
  amberDark:'#d97706',
  blue:     '#3b82f6',
  blueDark: '#1d4ed8',
  green:    '#10b981',
  greenBg:  '#dcfce7',
  red:      '#ef4444',
  redBg:    '#fee2e2',
  yellowBg: '#fef3c7',
  blueBg:   '#dbeafe',
} as const;

export function scoreColor(score: number): string {
  if (score >= 70) return COLORS.green;
  if (score >= 45) return COLORS.amber;
  return COLORS.red;
}

export function competitionColor(score: number): string {
  if (score <= 35) return COLORS.green;
  if (score <= 65) return COLORS.amber;
  return COLORS.red;
}
