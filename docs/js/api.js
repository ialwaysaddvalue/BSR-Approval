// ════════════════════════════════════════════════════════════════════════════
// api.js — Fully offline JavaScript (GitHub Pages / static deploy)
// Mirrors every Python endpoint in app.py with no backend required.
// ════════════════════════════════════════════════════════════════════════════

// ── Deterministic hash ────────────────────────────────────────────────────────
function _h(s, mod) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

// ── BSR Engine ────────────────────────────────────────────────────────────────
const BSR_PROFILES = {
  'kindle-ebooks': { name: 'Kindle eBooks',  a: 7440, b: 0.699, top100: 25000, top1000: 250000 },
  'books':         { name: 'Books (Print)',   a: 3700, b: 0.690, top100: 50000, top1000: 500000 },
  'audible':       { name: 'Audible Books',   a: 4800, b: 0.695, top100: 30000, top1000: 300000 },
};

function bsrToSales(bsr, cat) {
  const p = BSR_PROFILES[cat] || BSR_PROFILES['kindle-ebooks'];
  const monthly = p.a * Math.pow(bsr, -p.b);
  const daily   = monthly / 30;
  let comp, compS, oppS;
  if      (bsr <=   1000) { comp = 'Extreme';      compS = 95; oppS = 25; }
  else if (bsr <=   5000) { comp = 'Very High';     compS = 85; oppS = 35; }
  else if (bsr <=  10000) { comp = 'High';          compS = 70; oppS = 50; }
  else if (bsr <=  25000) { comp = 'Moderate-High'; compS = 60; oppS = 60; }
  else if (bsr <=  50000) { comp = 'Moderate';      compS = 45; oppS = 70; }
  else if (bsr <= 100000) { comp = 'Low-Moderate';  compS = 30; oppS = 75; }
  else if (bsr <= 500000) { comp = 'Low';           compS = 20; oppS = 65; }
  else                    { comp = 'Very Low';      compS = 10; oppS = 40; }
  return {
    bsr, category_name: p.name,
    daily_sales: Math.round(daily * 10) / 10,
    monthly_sales: Math.round(monthly),
    annual_sales: Math.round(monthly * 12),
    competition_level: comp, competition_score: compS, opportunity_score: oppS,
    top100_threshold: p.top100, top1000_threshold: p.top1000,
    in_top_100: bsr <= 100, in_top_1000: bsr <= 1000,
  };
}

// ── Keyword helpers ───────────────────────────────────────────────────────────
function fallbackKeywords(q) {
  return [
    `${q} for beginners`, `${q} guide`, `${q} handbook`,
    `${q} mastery`, `${q} complete guide`, `how to ${q}`,
    `learn ${q}`, `${q} secrets`, `${q} tips`, `advanced ${q}`,
    `${q} workbook`, `${q} for dummies`, `${q} 2024`, `best ${q} books`,
    `${q} step by step`, `${q} made easy`, `${q} essentials`, `${q} crash course`,
    `${q} quick start`, `${q} deep dive`,
  ];
}

async function getKeywords(q, limit = 20) {
  // Try Amazon autocomplete via a free CORS proxy
  try {
    const amazonUrl = `https://completion.amazon.com/api/2017/suggestions?mid=ATVPDKIKX0DER&alias=stripbooks&prefix=${encodeURIComponent(q)}&limit=${limit}`;
    const r = await fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(amazonUrl)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (r.ok) {
      const outer = await r.json();
      const inner = JSON.parse(outer.contents || '{}');
      const kws = (inner.suggestions || []).map(s => s.value);
      if (kws.length > 0) return kws.slice(0, limit);
    }
  } catch (_) {}
  return fallbackKeywords(q).slice(0, limit);
}

function enrichKeywords(keywords, baseVolume = 40000) {
  return keywords.map((kw, i) => {
    const wc   = kw.split(' ').length;
    const vol  = Math.max(50, baseVolume - i * 2500 - wc * 400 + _h(kw, 800));
    const comp = Math.min(95, Math.max(5, 78 - i * 4 - wc * 3 + _h(kw.split('').reverse().join(''), 15)));
    return {
      keyword: kw,
      estimated_monthly_searches: vol,
      competition_score: comp,
      opportunity_score: Math.min(100, Math.max(5, Math.round(vol / 800 * 0.4 + (100 - comp) * 0.6))),
      word_count: wc,
      type: wc > 2 ? 'long_tail' : 'broad',
      avg_cpc: Math.round((0.20 + comp / 100 * 1.60) * 100) / 100,
    };
  });
}

// ── Static data ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  'romance':             { name: 'Romance', competition: 92, trend: 'Stable', revenue: 'High', sub: ['Contemporary', 'Historical', 'Paranormal', 'Regency', 'Romantic Suspense', 'Clean & Wholesome', 'New Adult', 'Time Travel', 'Multicultural', 'Holiday', 'Sports', 'Small Town & Rural', 'Gothic', 'Sci-Fi Romance'] },
  'mystery-thriller':    { name: 'Mystery, Thriller & Suspense', competition: 85, trend: 'Rising', revenue: 'High', sub: ['Crime Fiction', 'Hard-Boiled', 'Historical Mystery', 'Legal Thriller', 'Medical Thriller', 'Police Procedurals', 'Psychological Thriller', 'Cozy Mystery', 'True Crime', 'Supernatural Mystery'] },
  'science-fiction':     { name: 'Science Fiction & Fantasy', competition: 83, trend: 'Rising', revenue: 'High', sub: ['Space Opera', 'Hard Science Fiction', 'Military Sci-Fi', 'Cyberpunk', 'Dystopian', 'LitRPG', 'Post-Apocalyptic', 'First Contact', 'Dark Fantasy', 'Epic Fantasy', 'Sword & Sorcery', 'Paranormal & Urban', 'Steampunk', 'Superhero'] },
  'self-help':           { name: 'Self-Help', competition: 78, trend: 'Rising', revenue: 'Very High', sub: ['Motivational', 'Success', 'Time Management', 'Relationships', 'Mental Health', 'Stress Management', 'Happiness', 'Creativity', 'Communication & Social Skills', 'Anger Management', 'Memory Improvement', 'Self-Esteem', 'Spiritual'] },
  'business-money':      { name: 'Business & Money', competition: 72, trend: 'Rising', revenue: 'Very High', sub: ['Entrepreneurship', 'Marketing & Sales', 'Personal Finance', 'Investing', 'Management & Leadership', 'Real Estate', 'Running a Business', 'Economics', 'Accounting', 'Job Hunting'] },
  'health-fitness':      { name: 'Health, Fitness & Dieting', competition: 70, trend: 'Rising', revenue: 'High', sub: ["Diets & Weight Loss", "Exercise & Fitness", "Nutrition", "Mental Health", "Women's Health", "Men's Health", "Aging", "Alternative Medicine", "Diseases & Ailments"] },
  'children':            { name: "Children's Books", competition: 68, trend: 'Stable', revenue: 'Moderate', sub: ['Picture Books', 'Early Readers', 'Chapter Books', 'Middle Grade', 'Activity Books', 'Educational', 'Animals', 'Holidays & Celebrations', 'Fairy Tales', 'Humor'] },
  'cookbooks':           { name: 'Cookbooks, Food & Wine', competition: 65, trend: 'Stable', revenue: 'Moderate', sub: ['Baking', 'Quick & Easy', 'Healthy Cooking', 'International Cooking', 'BBQ & Grilling', 'Vegetarian & Vegan', 'Desserts', 'Asian Cooking', 'Italian Cooking', 'Holiday Cooking'] },
  'history':             { name: 'History', competition: 58, trend: 'Stable', revenue: 'Moderate', sub: ['United States', 'World History', 'Military History', 'Ancient Civilizations', 'Europe', 'Asia', 'Middle East', 'Africa', 'Americas', 'Historical Study'] },
  'biographies':         { name: 'Biographies & Memoirs', competition: 62, trend: 'Stable', revenue: 'Moderate', sub: ['Business Leaders', 'Historical Figures', 'Sports Stars', 'Artists & Writers', 'Political Figures', 'Scientists', 'Personal Memoirs'] },
  'religion-spirituality': { name: 'Religion & Spirituality', competition: 60, trend: 'Stable', revenue: 'Moderate', sub: ['Christianity', 'New Age & Spirituality', 'Buddhism', 'Islam', 'Judaism', 'Hinduism', 'Devotional', 'Biblical Studies'] },
  'parenting':           { name: 'Parenting & Relationships', competition: 55, trend: 'Rising', revenue: 'Moderate', sub: ['Parenting', 'Marriage & Relationships', 'Pregnancy', 'Early Childhood', 'Divorce', 'Family Activities'] },
  'travel':              { name: 'Travel', competition: 52, trend: 'Rising', revenue: 'Low-Moderate', sub: ['Europe', 'United States', 'Asia', 'Latin America', 'Africa', 'Budget Travel', 'Adventure Travel'] },
  'education':           { name: 'Education & Teaching', competition: 48, trend: 'Stable', revenue: 'Moderate', sub: ['Curriculum & Lesson Plans', 'Special Education', 'Higher Education', 'Early Childhood', 'Homeschooling', 'Test Preparation'] },
  'crafts-hobbies':      { name: 'Crafts, Hobbies & Home', competition: 50, trend: 'Stable', revenue: 'Moderate', sub: ['Crafts & Hobbies', 'Home Improvement', 'Gardening', 'Sewing & Knitting', 'Woodworking', 'Drawing & Painting'] },
  'low-content':         { name: 'Low-Content Books', competition: 65, trend: 'Rising', revenue: 'Moderate', sub: ['Notebooks & Journals', 'Planners & Organizers', 'Activity Books', 'Coloring Books', 'Puzzle Books', 'Log Books & Trackers'] },
  'computers':           { name: 'Computers & Technology', competition: 68, trend: 'Rising', revenue: 'High', sub: ['Programming', 'AI & Machine Learning', 'Cybersecurity', 'Web Development', 'Data Science', 'Cloud Computing'] },
};

const GENRE_OPPORTUNITIES = [
  { id: 'cozy-mystery', name: 'Cozy Mystery', competition: 58, trend: 'Rising', series_potential: 'Very High', ku_compatible: true, avg_write_weeks: 8, achievable_bsr_range: [3000, 25000], topics: [
    { title: 'Bakery/café amateur sleuth series', demand: 88, notes: 'Readers buy entire series' },
    { title: 'Retired detective in small coastal town', demand: 82, notes: 'Ages 40+ demographic, very loyal' },
    { title: 'Cat café murder mystery series', demand: 80, notes: 'Pet + mystery crossover = double audience' },
    { title: 'Bookshop owner solves local crimes', demand: 78, notes: 'Meta appeal to book lovers' },
    { title: 'Yarn shop / quilting circle mystery', demand: 72, notes: 'Underserved niche, dedicated fans' },
  ]},
  { id: 'self-help', name: 'Self-Help / Personal Development', competition: 72, trend: 'Rising', series_potential: 'High', ku_compatible: true, avg_write_weeks: 5, achievable_bsr_range: [2000, 15000], topics: [
    { title: 'Anxiety relief workbook for adults (ages 25-45)', demand: 92, notes: 'Workbooks sell at $12-18, high perceived value' },
    { title: '30-day habit tracker + journal combo', demand: 87, notes: 'Seasonal peaks in Jan, Sep' },
    { title: 'Boundaries and people-pleasing recovery', demand: 85, notes: 'Social media-driven demand, trending topic' },
    { title: 'ADHD productivity system for entrepreneurs', demand: 83, notes: 'Underserved professional niche' },
    { title: 'Dopamine detox and screen-time recovery', demand: 80, notes: '2024-2026 trending keyword cluster' },
  ]},
  { id: 'romance', name: 'Clean / Wholesome Romance', competition: 65, trend: 'Stable', series_potential: 'Very High', ku_compatible: true, avg_write_weeks: 6, achievable_bsr_range: [1500, 12000], topics: [
    { title: 'Small-town second-chance romance (firefighter/nurse)', demand: 90, notes: 'Evergreen sub-genre, high KU page reads' },
    { title: 'Grumpy sunshine forced proximity', demand: 88, notes: '#1 romance trope on BookTok right now' },
    { title: "Cowboy/rancher clean western romance", demand: 82, notes: 'Older demographic, buys full series' },
    { title: "Sports romance (hockey player + rival's sister)", demand: 85, notes: 'Very strong sub-community' },
    { title: 'Fake dating small-town Christmas romance', demand: 80, notes: 'Holiday releases spike sales 3x' },
  ]},
  { id: 'business-money', name: 'Business & Entrepreneurship', competition: 68, trend: 'Rising', series_potential: 'Moderate', ku_compatible: false, avg_write_weeks: 7, achievable_bsr_range: [2500, 20000], topics: [
    { title: 'AI tools for small business owners (practical guide)', demand: 95, notes: '2024-2026 peak demand window' },
    { title: 'Etsy/side hustle to $5K/month step-by-step', demand: 88, notes: 'Aspirational, specific, high conversion' },
    { title: 'Real estate investing for W-2 employees', demand: 85, notes: 'Perennial seller, high price tolerance' },
    { title: 'Content creator monetization playbook', demand: 83, notes: 'Growing niche, aspirational buyer' },
    { title: 'Bookkeeping and taxes for freelancers', demand: 80, notes: 'Annual repurchase potential' },
  ]},
  { id: 'science-fiction', name: 'LitRPG / GameLit', competition: 45, trend: 'Rising', series_potential: 'Very High', ku_compatible: true, avg_write_weeks: 10, achievable_bsr_range: [2000, 18000], topics: [
    { title: 'Cultivation / progression fantasy (isekai-adjacent)', demand: 90, notes: 'Fastest growing SFF sub-genre on KU' },
    { title: 'System apocalypse survival with stats', demand: 87, notes: 'Strong series loyalty, daily KU readers' },
    { title: 'Tower climb dungeon core fantasy', demand: 83, notes: 'Sub-genre with dedicated subreddit community' },
    { title: 'Solo leveling style manhwa-inspired novel', demand: 82, notes: 'Anime crossover audience' },
    { title: 'Virtual reality sports LitRPG', demand: 75, notes: 'Underserved mashup niche' },
  ]},
  { id: 'children', name: "Children's Picture Books", competition: 55, trend: 'Stable', series_potential: 'High', ku_compatible: true, avg_write_weeks: 3, achievable_bsr_range: [5000, 40000], topics: [
    { title: 'Emotions & feelings (anxiety, anger) for ages 3-6', demand: 88, notes: 'Therapist/school recommended = bulk buys' },
    { title: 'Bedtime routine + sleep books', demand: 85, notes: 'Perennial gifted item, repeat purchase' },
    { title: 'Diverse representation series (multicultural families)', demand: 82, notes: 'Library purchasing programs' },
    { title: 'STEM curiosity (female scientists/inventors)', demand: 80, notes: 'Gift market + school market' },
    { title: 'Potty training / first day of school milestone', demand: 78, notes: 'Every parent buys at least once' },
  ]},
  { id: 'health-fitness', name: 'Health & Wellness', competition: 62, trend: 'Rising', series_potential: 'Moderate', ku_compatible: false, avg_write_weeks: 6, achievable_bsr_range: [2000, 18000], topics: [
    { title: 'Anti-inflammatory diet for beginners (30-day plan)', demand: 90, notes: 'Perennial high seller with seasonal spikes' },
    { title: 'Menopause nutrition and weight management', demand: 88, notes: 'Underserved, high-paying demographic' },
    { title: 'Strength training for women over 40', demand: 85, notes: 'Fastest growing fitness demographic' },
    { title: 'Gut health and microbiome reset protocol', demand: 83, notes: 'TikTok/social-driven trend with longevity' },
    { title: 'Low-carb / carnivore diet quick-start guide', demand: 80, notes: 'Loyal community, buys multiple resources' },
  ]},
  { id: 'low-content', name: 'Low-Content Books (Journals/Planners)', competition: 50, trend: 'Rising', series_potential: 'Very High', ku_compatible: false, avg_write_weeks: 1, achievable_bsr_range: [8000, 60000], topics: [
    { title: 'Niche-themed gratitude journals (sobriety, grief, new moms)', demand: 85, notes: 'Low competition in specific sub-niches' },
    { title: 'Habit tracker + weekly planner combo (6-month)', demand: 82, notes: 'Best-seller format, easy to publish at scale' },
    { title: 'Grief journal for adults (lose a parent/spouse)', demand: 80, notes: 'Very underserved emotional niche' },
    { title: 'Business budget & goal tracker (entrepreneur edition)', demand: 78, notes: 'High price tolerance, buy as gifts' },
    { title: 'Teacher planner / classroom organizer', demand: 75, notes: 'Annual repurchase, school gifting' },
  ]},
];

// ── API object — mirrors every backend endpoint ───────────────────────────────
const API = {

  keywords: {
    suggest: async (q, limit = 20) => {
      const kws = await getKeywords(q, limit);
      return { seed_keyword: q, keywords: enrichKeywords(kws.slice(0, limit)) };
    },
    analyze: async (q) => {
      const kws = await getKeywords(q, 20);
      const enriched = enrichKeywords(kws);
      const avgComp  = enriched.reduce((s, k) => s + k.competition_score, 0) / Math.max(enriched.length, 1);
      const totalVol = enriched.reduce((s, k) => s + k.estimated_monthly_searches, 0);
      return {
        seed_keyword: q,
        summary: {
          total_monthly_searches: totalVol,
          avg_competition_score: Math.round(avgComp),
          opportunity_score: Math.min(100, Math.round(100 - avgComp + 15)),
          avg_cpc: Math.round((0.25 + avgComp / 100 * 1.55) * 100) / 100,
          kdp_ads_recommended: avgComp < 65,
          keyword_count: enriched.length,
        },
        keywords: enriched,
        long_tail: enriched.filter(k => k.word_count > 2),
        broad:     enriched.filter(k => k.word_count <= 2),
      };
    },
  },

  bsr: {
    calculate: async (bsr, category, price, royalty) => {
      bsr     = parseInt(bsr);
      price   = parseFloat(price);
      royalty = parseFloat(royalty);
      const stats      = bsrToSales(bsr, category);
      const royaltyPer = Math.round(price * royalty * 100) / 100;
      const monthlyRev = Math.round(stats.monthly_sales * royaltyPer * 100) / 100;
      const trend = [];
      for (let day = 1; day <= 30; day++) {
        const noise = _h(`${bsr}-${day}`, Math.floor(bsr * 0.25) + 1) - Math.floor(bsr * 0.125);
        trend.push({ day, bsr: Math.max(1, bsr + noise) });
      }
      return {
        ...stats,
        revenue: {
          price, royalty_rate: royalty, royalty_per_sale: royaltyPer,
          monthly_revenue: monthlyRev,
          annual_revenue: Math.round(monthlyRev * 12 * 100) / 100,
        },
        bsr_trend: trend,
        available_categories: Object.keys(BSR_PROFILES),
      };
    },
  },

  categories: {
    list: async () => {
      const out = Object.entries(CATEGORIES).map(([k, v]) => ({
        id: k, name: v.name, competition_score: v.competition,
        trend: v.trend, revenue_potential: v.revenue, subcategory_count: v.sub.length,
      }));
      out.sort((a, b) => b.competition_score - a.competition_score);
      return { categories: out, total: out.length };
    },
    get: async (id) => {
      const c = CATEGORIES[id];
      if (!c) throw new Error('Category not found');
      const subs = c.sub.map((name, i) => {
        const comp   = Math.min(95, Math.max(10, c.competition - 10 + _h(name, 25) - 5));
        const demand = Math.min(98, Math.max(20, 80 - i * 2 + _h(name.split('').reverse().join(''), 20) - 5));
        return {
          name, competition_score: comp, demand_score: demand,
          opportunity_score: Math.round(demand * 0.55 + (100 - comp) * 0.45),
          top100_bsr_threshold: 8000 + i * 4000 + _h(name, 30000),
          est_monthly_revenue: Math.round(100000 / Math.max(comp, 1) * 45),
          trend: ['Rising', 'Stable', 'Declining'][_h(name, 3)],
          recommended: comp < 60 && demand > 55,
        };
      });
      subs.sort((a, b) => b.opportunity_score - a.opportunity_score);
      return { id, name: c.name, competition_score: c.competition, trend: c.trend, subcategories: subs };
    },
  },

  niche: {
    search: async (q, limit = 12) => {
      const kws = await getKeywords(q, limit + 5);
      const niches = kws.slice(0, limit).map((phrase, i) => {
        const comp   = Math.max(10, 65 - i * 4 + _h(phrase, 20) - 10);
        const demand = Math.max(20, 75 - i * 2 + _h(phrase.split('').reverse().join(''), 20) - 5);
        const opp    = Math.round(demand * 0.55 + (100 - comp) * 0.45);
        return {
          niche: phrase, competition_score: comp, demand_score: demand, opportunity_score: opp,
          estimated_books_in_niche: 30 + comp * 8 + _h(phrase, 400),
          avg_reviews_top_10: Math.max(3, 12 + Math.floor(comp / 5) + _h(phrase + 'r', 25)),
          avg_price_top_10: Math.round((7.99 + _h(phrase, 10)) * 100) / 100,
          trend: ['Rising', 'Stable', 'Declining'][_h(phrase, 3)],
          tier: opp >= 70 ? 'Green' : opp >= 45 ? 'Yellow' : 'Red',
          recommendation: opp >= 70 ? 'Highly Recommended' : opp >= 45 ? 'Proceed with Caution' : 'Avoid',
        };
      });
      niches.sort((a, b) => b.opportunity_score - a.opportunity_score);
      return { topic: q, niches, best_niche: niches[0] || null };
    },
  },

  ads: {
    keywords: async (q, budget) => {
      const kws = await getKeywords(q, 18);
      const results = kws.map((kw, i) => {
        const bidLow = Math.round((0.12 + _h(kw, 40) / 100) * 100) / 100;
        const bidSug = Math.round(bidLow * 1.6 * 100) / 100;
        const bidHi  = Math.round(bidLow * 2.8 * 100) / 100;
        return {
          keyword: kw, match_type: ['Broad', 'Phrase', 'Exact'][i % 3],
          bid_low: bidLow, bid_suggested: bidSug, bid_high: bidHi,
          est_daily_clicks: Math.round(budget / Math.max(bidSug, 0.01) * 10) / 10,
          competition: ['Low', 'Medium', 'High'][_h(kw, 3)],
          relevance_score: Math.max(45, 100 - i * 4),
        };
      });
      return {
        seed_keyword: q, daily_budget: budget, keywords: results,
        campaign_tip: `Start with Phrase match for '${q}' at $${parseFloat(budget).toFixed(2)}/day. Broad match for discovery, Exact for ACOS control.`,
      };
    },
  },

  market: {
    overview: async () => {
      const categories = Object.entries(CATEGORIES).map(([id, c]) => ({
        id, name: c.name, competition_score: c.competition, trend: c.trend,
        revenue_potential: c.revenue,
        monthly_books_published: 1000 + c.competition * 120 + _h(id, 3000),
      }));
      categories.sort((a, b) => b.competition_score - a.competition_score);
      return {
        categories,
        market_stats: {
          total_kdp_books: '7.2M+', monthly_new_books: '300,000+',
          avg_kindle_price: '$4.99', avg_print_price: '$12.99', kindle_unlimited_titles: '4M+',
        },
        top_opportunities: [
          { niche: 'LitRPG / GameLit',             reason: 'Rapidly growing readership, under-served'   },
          { niche: 'Cozy Mystery',                  reason: 'Strong reader loyalty, series potential'    },
          { niche: 'AI & Technology Self-Help',     reason: 'Surging demand, low existing supply'        },
          { niche: 'Clean Romance',                 reason: 'Large audience, KU compatible'              },
          { niche: 'Cybersecurity for Non-Techies', reason: 'High search volume, few quality titles'     },
        ],
      };
    },
  },

  lowcontent: {
    ideas: async (topic, limit = 24) => {
      const templates = [
        ['Journal',  ['Lined Journal','Dot Grid Journal','Blank Journal','Guided Journal','Prompted Journal']],
        ['Planner',  ['Daily Planner','Weekly Planner','Monthly Planner','Goal Planner','Academic Planner','Budget Planner']],
        ['Notebook', ['College Ruled Notebook','Wide Ruled Notebook','Graph Paper Notebook','Composition Notebook']],
        ['Tracker',  ['Habit Tracker','Mood Tracker','Sleep Log','Workout Log','Food Log','Reading Log']],
        ['Activity', ['Coloring Book','Word Search','Crossword Puzzle','Sudoku Book','Maze Book']],
        ['Diary',    ['Daily Diary','Travel Diary','Dream Journal','Gratitude Journal']],
        ['Workbook', ['Practice Workbook','Study Workbook','Self-Study Guide']],
      ];
      const ideas = [];
      for (const [typeName, variants] of templates) {
        for (const variant of variants) {
          const title  = topic.trim() ? `${topic.trim()} ${variant}` : variant;
          const rev    = title.split('').reverse().join('');
          const comp   = Math.max(10, 35 + _h(title, 45));
          const demand = Math.max(20, 55 + _h(rev, 35));
          const opp    = Math.round(demand * 0.55 + (100 - comp) * 0.45);
          ideas.push({
            title, type: typeName, competition_score: comp, demand_score: demand, opportunity_score: opp,
            est_monthly_sales: Math.max(1, Math.round((demand - comp / 2) * 0.4)),
            recommended_price: demand > 70 ? '$7.99' : demand > 50 ? '$6.99' : '$5.99',
            trim_size: ['Activity','Planner'].includes(typeName) ? '8.5x11' : '6x9',
            page_count: typeName === 'Activity' ? 50 : 120,
            recommended: opp >= 65,
          });
        }
      }
      ideas.sort((a, b) => b.opportunity_score - a.opportunity_score);
      return { topic: topic || 'General', total_ideas: ideas.length, ideas: ideas.slice(0, limit), top_pick: ideas[0] || null };
    },
  },

  book: {
    analyze: async (asin) => {
      asin = asin.toUpperCase();
      const seed   = _h(asin, 10000);
      const bsrMain = 500 + seed * 8;
      const monthly = bsrToSales(bsrMain, 'kindle-ebooks').monthly_sales;
      const price   = Math.round((9.99 + _h(asin + 'p', 15)) * 100) / 100;
      const catKeys = Object.keys(CATEGORIES);
      const idx     = seed % catKeys.length;
      return {
        asin, estimated_bsr: bsrMain,
        estimated_category_bsr: Math.max(1, Math.floor(bsrMain / 12)),
        estimated_monthly_sales: monthly,
        estimated_monthly_revenue: Math.round(monthly * price * 0.70 * 100) / 100,
        review_count: 5 + _h(asin + 'r', 3000),
        avg_rating: Math.min(5.0, Math.round((3.5 + _h(asin + 'ra', 16) / 10) * 10) / 10),
        page_count: 150 + _h(asin + 'pg', 250),
        estimated_price: price,
        categories: catKeys.slice(idx, idx + 3).map(c => CATEGORIES[c]?.name).filter(Boolean),
        competition_score: Math.min(95, 30 + seed % 60),
        opportunity_score: Math.max(10, 80 - seed % 50),
        note: 'Estimates based on BSR algorithms. Real data requires Amazon PA API credentials.',
      };
    },
  },

  profitGoal: async (monthly_target, price, royalty, books) => {
    monthly_target = parseFloat(monthly_target);
    price          = parseFloat(price);
    royalty        = parseFloat(royalty);
    books          = parseInt(books);
    const royaltyPer  = Math.round(price * royalty * 100) / 100;
    const totalCopies = Math.ceil(monthly_target / royaltyPer);
    const copiesPerBook = Math.ceil(totalCopies / books);
    const a = 7440, b = 0.699;
    const requiredBsr = copiesPerBook <= 0 ? 9999999 : Math.round(Math.pow(copiesPerBook / a, -1 / b));

    let achieveLabel, achieveScore;
    if      (requiredBsr <  1000) { achieveLabel = 'Very Hard';  achieveScore = 20; }
    else if (requiredBsr <  3000) { achieveLabel = 'Hard';       achieveScore = 40; }
    else if (requiredBsr <  8000) { achieveLabel = 'Moderate';   achieveScore = 60; }
    else if (requiredBsr < 25000) { achieveLabel = 'Achievable'; achieveScore = 80; }
    else                          { achieveLabel = 'Easy';       achieveScore = 95; }

    const recommendations = GENRE_OPPORTUNITIES.map(genre => {
      const [bsrLo, bsrHi] = genre.achievable_bsr_range;
      let fitScore;
      if      (requiredBsr < bsrLo * 0.4) fitScore = 22;
      else if (requiredBsr < bsrLo * 0.7) fitScore = 40;
      else if (requiredBsr <= bsrLo)       fitScore = 62;
      else if (requiredBsr <= bsrHi)       fitScore = Math.round(68 + 28 * (requiredBsr - bsrLo) / (bsrHi - bsrLo));
      else                                 fitScore = 98;
      fitScore = Math.min(98, Math.max(10, fitScore));
      return {
        genre: genre.name, genre_id: genre.id, competition_score: genre.competition,
        trend: genre.trend, series_potential: genre.series_potential,
        ku_compatible: genre.ku_compatible, avg_weeks_to_write: genre.avg_write_weeks,
        fit_score: fitScore, topics: genre.topics,
        scenario: {
          books, copies_per_book_needed: copiesPerBook, required_bsr_per_book: requiredBsr,
          achievability: achieveLabel, achievability_score: achieveScore,
          monthly_if_achieved: Math.round(copiesPerBook * books * royaltyPer * 100) / 100,
        },
      };
    });
    recommendations.sort((a, b) => b.fit_score - a.fit_score);

    const summary = achieveScore >= 80
      ? `Great news — selling ${copiesPerBook} copies/month per book at $${price} is very achievable for a new author.`
      : achieveScore >= 60
      ? `Selling ${copiesPerBook} copies/month per book is realistic but will take 3–6 months of effort to reach.`
      : `Selling ${copiesPerBook} copies/month per book is ambitious. Consider a higher price or more books to make the goal easier.`;

    return {
      goal: {
        monthly_target, price, royalty_rate: royalty, royalty_per_book: royaltyPer,
        books_in_portfolio: books, total_copies_needed_monthly: totalCopies,
        copies_per_book_per_month: copiesPerBook, required_bsr_per_book: requiredBsr,
        achievability: achieveLabel, achievability_score: achieveScore, summary,
      },
      top_genres: recommendations.slice(0, 5),
      all_genres: recommendations,
    };
  },
};
