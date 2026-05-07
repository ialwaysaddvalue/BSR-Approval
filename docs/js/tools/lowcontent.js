function initLowContent() {
  document.getElementById('lc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = document.getElementById('lc-input').value.trim();
    await runLowContentSearch(topic);
  });

  // All filter buttons
  const filterMap = {
    'lc-filter-all':      'all',
    'lc-filter-journal':  'Journal',
    'lc-filter-planner':  'Planner',
    'lc-filter-tracker':  'Tracker',
    'lc-filter-activity': 'Activity',
    'lc-filter-notebook': 'Notebook',
    'lc-filter-diary':    'Diary',
    'lc-filter-workbook': 'Workbook',
  };
  Object.entries(filterMap).forEach(([btnId, typeVal]) => {
    const el = document.getElementById(btnId);
    if (el) el.addEventListener('click', () => filterLcType(typeVal));
  });

  // CSV download
  const csvBtn = document.getElementById('lc-download-csv');
  if (csvBtn) csvBtn.addEventListener('click', downloadLcCsv);

  // Load general ideas on init
  runLowContentSearch('');
}

let lastLcData = null;
let currentLcFilter = 'all';

function filterLcType(type) {
  currentLcFilter = type;

  // Update active state on all filter buttons
  const filterMap = {
    'all':      'lc-filter-all',
    'Journal':  'lc-filter-journal',
    'Planner':  'lc-filter-planner',
    'Tracker':  'lc-filter-tracker',
    'Activity': 'lc-filter-activity',
    'Notebook': 'lc-filter-notebook',
    'Diary':    'lc-filter-diary',
    'Workbook': 'lc-filter-workbook',
  };
  Object.entries(filterMap).forEach(([t, btnId]) => {
    const el = document.getElementById(btnId);
    if (el) el.classList.toggle('active', t === type);
  });

  if (!lastLcData) return;
  // Fixed filter: directly compare i.type === type
  const filtered = type === 'all'
    ? lastLcData.ideas
    : lastLcData.ideas.filter(i => i.type === type);
  renderLcGrid(filtered);
}

async function runLowContentSearch(topic) {
  const out = document.getElementById('lc-results');
  showLoading(out, 'Generating low-content book ideas…');
  try {
    const data = await API.lowcontent.ideas(topic, 48); // request more so filtering shows enough
    lastLcData = data;
    currentLcFilter = 'all';
    // Reset active filter buttons
    document.querySelectorAll('[id^="lc-filter-"]').forEach(el => el.classList.remove('active'));
    const allBtn = document.getElementById('lc-filter-all');
    if (allBtn) allBtn.classList.add('active');
    renderLcPage(data);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderLcPage(data) {
  const out = document.getElementById('lc-results');
  if (!data.ideas || data.ideas.length === 0) {
    showEmpty(out, '📓', 'No ideas found', 'Try a different topic');
    return;
  }

  const best = data.top_pick;
  out.innerHTML = `
    ${best ? `<div class="alert alert-success mb-4">
      <strong>Top Pick:</strong> "${escHtml(best.title)}" — Opportunity ${best.opportunity_score}/100 | Est. ${best.est_monthly_sales} sales/mo at ${best.recommended_price}
    </div>` : ''}
    <div id="lc-grid"></div>`;

  renderLcGrid(data.ideas);
}

function renderLcGrid(ideas) {
  const grid = document.getElementById('lc-grid');
  if (!grid) return;

  if (ideas.length === 0) {
    grid.innerHTML = '<p class="text-muted text-sm" style="padding:16px">No ideas match this filter. Try a different type or clear the filter.</p>';
    return;
  }

  grid.innerHTML = `
    <div class="lc-grid">
      ${ideas.map(i => `
        <div class="lc-card${i.recommended ? ' recommended' : ''}">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div class="lc-card-title">${escHtml(i.title)}</div>
            ${i.recommended ? badge('★ Pick', 'green') : ''}
          </div>
          <div class="mb-2">
            ${scoreBar(i.opportunity_score)}
          </div>
          <div class="lc-meta">
            <div class="lc-meta-item">
              <strong>${i.opportunity_score}/100</strong>Opportunity
            </div>
            <div class="lc-meta-item">
              <strong>${i.competition_score}</strong>Competition
            </div>
            <div class="lc-meta-item">
              <strong>${i.demand_score}</strong>Demand
            </div>
            <div class="lc-meta-item">
              <strong>~${i.est_monthly_sales}/mo</strong>Est. Sales
            </div>
            <div class="lc-meta-item">
              <strong>${i.recommended_price}</strong>Rec. Price
            </div>
            <div class="lc-meta-item">
              <strong>${i.trim_size}</strong>Trim Size
            </div>
            <div class="lc-meta-item">
              <strong>${i.page_count} pgs</strong>Page Count
            </div>
            <div class="lc-meta-item">
              <strong>${i.type}</strong>Type
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

function downloadLcCsv() {
  if (!lastLcData || !lastLcData.ideas.length) return;

  const headers = ['Title','Type','Opportunity Score','Competition','Demand','Est. Monthly Sales','Recommended Price','Trim Size','Page Count','Recommended'];
  const rows = lastLcData.ideas.map(i => [
    `"${i.title.replace(/"/g, '""')}"`,
    i.type,
    i.opportunity_score,
    i.competition_score,
    i.demand_score,
    i.est_monthly_sales,
    i.recommended_price,
    i.trim_size,
    i.page_count,
    i.recommended ? 'Yes' : 'No',
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `low-content-ideas-${(lastLcData.topic || 'general').toLowerCase().replace(/\s+/g,'-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
