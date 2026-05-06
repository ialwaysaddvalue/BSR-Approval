// BSR ↔ sales formula calibrated to Publisher Rocket benchmarks
// BSR 100 ≈ 298/mo | BSR 1,000 ≈ 60/mo | BSR 15,000 ≈ 9/mo

const BSR_PARAMS = {
  kindle:  { a: 7_440, b: 0.699 },
  print:   { a: 3_700, b: 0.690 },
  audible: { a: 4_800, b: 0.695 },
} as const;

export type BsrCategory = keyof typeof BSR_PARAMS;

export function bsrToMonthly(bsr: number, category: BsrCategory = 'kindle'): number {
  const { a, b } = BSR_PARAMS[category];
  return Math.max(0, Math.round(a * Math.pow(bsr, -b)));
}

export function monthlyToBsr(monthly: number): number {
  if (monthly <= 0) return 9_999_999;
  const { a, b } = BSR_PARAMS.kindle;
  return Math.round(Math.pow(monthly / a, -1 / b));
}

export interface CompetitionInfo {
  level: string;
  score: number;
  opportunityScore: number;
}

export function getCompetitionInfo(bsr: number): CompetitionInfo {
  if (bsr <= 1_000)  return { level: 'Extreme',       score: 95, opportunityScore: 25 };
  if (bsr <= 5_000)  return { level: 'Very High',     score: 85, opportunityScore: 35 };
  if (bsr <= 15_000) return { level: 'High',          score: 65, opportunityScore: 60 };
  if (bsr <= 50_000) return { level: 'Moderate',      score: 45, opportunityScore: 75 };
  return               { level: 'Low',          score: 25, opportunityScore: 85 };
}

export interface AchievabilityInfo {
  label: string;
  score: number;
  color: string;
}

export function getAchievability(requiredBsr: number): AchievabilityInfo {
  if (requiredBsr < 1_000)  return { label: 'Very Hard',  score: 20, color: '#ef4444' };
  if (requiredBsr < 3_000)  return { label: 'Hard',       score: 40, color: '#f59e0b' };
  if (requiredBsr < 8_000)  return { label: 'Moderate',   score: 60, color: '#f59e0b' };
  if (requiredBsr < 25_000) return { label: 'Achievable', score: 80, color: '#10b981' };
  return                     { label: 'Easy',        score: 95, color: '#10b981' };
}

export function getFitScore(requiredBsr: number, bsrLo: number, bsrHi: number): number {
  if (requiredBsr < bsrLo * 0.4)  return 22;
  if (requiredBsr < bsrLo * 0.7)  return 40;
  if (requiredBsr <= bsrLo)        return 62;
  if (requiredBsr <= bsrHi) {
    const pct = (requiredBsr - bsrLo) / (bsrHi - bsrLo);
    return Math.round(68 + 28 * pct);
  }
  return 98;
}
