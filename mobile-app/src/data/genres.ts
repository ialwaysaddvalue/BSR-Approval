export interface GenreTopic {
  title: string;
  demand: number;
  notes: string;
}

export interface Genre {
  id: string;
  name: string;
  competition: number;
  trend: 'Rising' | 'Stable' | 'Declining';
  seriesPotential: 'Very High' | 'High' | 'Moderate';
  kuCompatible: boolean;
  avgWriteWeeks: number;
  bsrRange: [number, number]; // [achievable_lo, achievable_hi]
  topics: GenreTopic[];
}

export const GENRES: Genre[] = [
  {
    id: 'cozy-mystery',
    name: 'Cozy Mystery',
    competition: 58, trend: 'Rising', seriesPotential: 'Very High',
    kuCompatible: true, avgWriteWeeks: 8,
    bsrRange: [3_000, 25_000],
    topics: [
      { title: 'Bakery/café amateur sleuth series', demand: 88, notes: 'Readers buy entire series — high KU page reads' },
      { title: 'Retired detective in small coastal town', demand: 82, notes: 'Ages 40+ demographic, very loyal buyers' },
      { title: 'Cat café murder mystery series', demand: 80, notes: 'Pet + mystery crossover = double the audience' },
      { title: 'Bookshop owner solves local crimes', demand: 78, notes: 'Meta appeal to book lovers' },
    ],
  },
  {
    id: 'self-help',
    name: 'Self-Help / Personal Development',
    competition: 72, trend: 'Rising', seriesPotential: 'High',
    kuCompatible: true, avgWriteWeeks: 5,
    bsrRange: [2_000, 15_000],
    topics: [
      { title: 'Anxiety relief workbook for adults', demand: 92, notes: 'Workbooks sell at $12–18, high perceived value' },
      { title: '30-day habit tracker + journal combo', demand: 87, notes: 'Seasonal peaks in Jan & Sep' },
      { title: 'Boundaries and people-pleasing recovery', demand: 85, notes: 'Social media-driven demand, trending topic' },
      { title: 'ADHD productivity for entrepreneurs', demand: 83, notes: 'Underserved professional niche' },
    ],
  },
  {
    id: 'romance',
    name: 'Clean / Wholesome Romance',
    competition: 65, trend: 'Stable', seriesPotential: 'Very High',
    kuCompatible: true, avgWriteWeeks: 6,
    bsrRange: [1_500, 12_000],
    topics: [
      { title: 'Small-town second-chance (firefighter/nurse)', demand: 90, notes: 'Evergreen sub-genre, high KU page reads' },
      { title: 'Grumpy sunshine forced proximity', demand: 88, notes: '#1 romance trope on BookTok right now' },
      { title: 'Cowboy/rancher clean western romance', demand: 82, notes: 'Older demographic, buys full series' },
      { title: 'Fake dating small-town Christmas', demand: 80, notes: 'Holiday releases spike sales 3×' },
    ],
  },
  {
    id: 'business',
    name: 'Business & Entrepreneurship',
    competition: 68, trend: 'Rising', seriesPotential: 'Moderate',
    kuCompatible: false, avgWriteWeeks: 7,
    bsrRange: [2_500, 20_000],
    topics: [
      { title: 'AI tools for small business owners', demand: 95, notes: '2024–2026 peak demand window' },
      { title: 'Etsy/side hustle to $5K/month guide', demand: 88, notes: 'Aspirational, specific, high conversion' },
      { title: 'Real estate investing for W-2 employees', demand: 85, notes: 'Perennial seller, high price tolerance' },
      { title: 'Content creator monetization playbook', demand: 83, notes: 'Growing niche, aspirational buyer' },
    ],
  },
  {
    id: 'litrpg',
    name: 'LitRPG / GameLit',
    competition: 45, trend: 'Rising', seriesPotential: 'Very High',
    kuCompatible: true, avgWriteWeeks: 10,
    bsrRange: [2_000, 18_000],
    topics: [
      { title: 'Cultivation / progression fantasy', demand: 90, notes: 'Fastest-growing SFF sub-genre on KU' },
      { title: 'System apocalypse survival with stats', demand: 87, notes: 'Strong series loyalty, daily KU readers' },
      { title: 'Tower climb dungeon core fantasy', demand: 83, notes: 'Dedicated subreddit community' },
      { title: 'Solo leveling style manhwa-inspired novel', demand: 82, notes: 'Anime crossover audience' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    competition: 62, trend: 'Rising', seriesPotential: 'Moderate',
    kuCompatible: false, avgWriteWeeks: 6,
    bsrRange: [2_000, 18_000],
    topics: [
      { title: 'Anti-inflammatory diet (30-day plan)', demand: 90, notes: 'Perennial high seller, seasonal spikes' },
      { title: 'Menopause nutrition & weight management', demand: 88, notes: 'Underserved, high-paying demographic' },
      { title: 'Strength training for women over 40', demand: 85, notes: 'Fastest-growing fitness demographic' },
      { title: 'Gut health & microbiome reset protocol', demand: 83, notes: 'TikTok-driven trend with longevity' },
    ],
  },
  {
    id: 'children',
    name: "Children's Picture Books",
    competition: 55, trend: 'Stable', seriesPotential: 'High',
    kuCompatible: true, avgWriteWeeks: 3,
    bsrRange: [5_000, 40_000],
    topics: [
      { title: 'Emotions/feelings (anxiety, anger) ages 3–6', demand: 88, notes: 'Therapist-recommended = bulk buys' },
      { title: 'Bedtime routine + sleep books', demand: 85, notes: 'Perennial gifted item, repeat purchase' },
      { title: 'Diverse multicultural family series', demand: 82, notes: 'Library purchasing programs' },
      { title: 'STEM curiosity (female scientists)', demand: 80, notes: 'Gift market + school market' },
    ],
  },
  {
    id: 'low-content',
    name: 'Low-Content Books',
    competition: 50, trend: 'Rising', seriesPotential: 'Very High',
    kuCompatible: false, avgWriteWeeks: 1,
    bsrRange: [8_000, 60_000],
    topics: [
      { title: 'Niche gratitude journals (sobriety, grief)', demand: 85, notes: 'Low competition in specific sub-niches' },
      { title: 'Habit tracker + weekly planner combo', demand: 82, notes: 'Best-seller format, easy to publish at scale' },
      { title: 'Grief journal for adults', demand: 80, notes: 'Very underserved emotional niche' },
      { title: 'Business budget & goal tracker', demand: 78, notes: 'High price tolerance, bought as gifts' },
    ],
  },
];
