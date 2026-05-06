// ── Navigation ────────────────────────────────────────────────────────────────

const TOOLS = {
  dashboard:     { title: 'Dashboard',           subtitle: 'Market overview & quick access' },
  'profit-goal': { title: 'Profit Goal',         subtitle: 'Tell us your target income — get specific genres & topics to write' },
  'keywords':    { title: 'Keyword Research',    subtitle: 'Discover high-value Amazon book keywords' },
  'bsr':         { title: 'BSR Calculator',      subtitle: 'Convert Best Seller Rank to estimated monthly sales' },
  'categories':  { title: 'Category Explorer',   subtitle: 'Browse all Amazon book categories with competition data' },
  'niche':       { title: 'Niche Finder',        subtitle: 'Identify low-competition, high-demand niches' },
  'ads':         { title: 'KDP Ads Keywords',    subtitle: 'Build winning Amazon Ads keyword campaigns' },
  'market':      { title: 'Market Overview',     subtitle: 'Genre trends, competition, and revenue data' },
  'lowcontent':  { title: 'Low-Content Ideas',   subtitle: 'Journals, planners, notebooks and more' },
  'book':        { title: 'Book Analyzer',       subtitle: 'Analyze any book by ASIN' },
};

let activeNav = 'dashboard';

function navigate(toolId) {
  const id = toolId.startsWith('tool-') ? toolId.slice(5) : toolId;
  if (!TOOLS[id]) return;

  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === id);
  });

  // Update topbar
  document.getElementById('topbar-title').textContent    = TOOLS[id].title;
  document.getElementById('topbar-subtitle').textContent = TOOLS[id].subtitle;

  // Show/hide panels
  document.querySelectorAll('.tool-panel').forEach(el => {
    el.classList.toggle('hidden', el.id !== `panel-${id}`);
  });

  activeNav = id;
  window.location.hash = id;
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Wire sidebar clicks
  document.querySelectorAll('.nav-item[data-tool]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.tool));
  });

  // Init all tools
  initProfitGoal();
  initKeywords();
  initBsr();
  initCategories();
  initNiche();
  initAds();
  initMarket();
  initLowContent();
  initBook();
  initDashboard();

  // Route from hash
  const hash = window.location.hash.slice(1);
  navigate(hash && TOOLS[hash] ? hash : 'dashboard');
});
