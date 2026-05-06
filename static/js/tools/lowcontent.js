function initLowContent() {
  document.getElementById('lc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = document.getElementById('lc-input').value.trim();
    await runLowContentSearch(topic);
  });

  document.getElementById('lc-filter-all').addEventListener('click', () => filterLcType('all'));
  document.getElementById('lc-filter-journal').addEventListener('click', () => filterLcType('Journal'));
  document.getElementById('lc-filter-planner').addEventListener('click', () => filterLcType('Planner'));
  document.getElementById('lc-filter-tracker').addEventListener('click', () => filterLcType('Tracker'));
  document.getElementById('lc-filter-activity').addEventListener('click', () => filterLcType('Activity'));

  // Load general ideas on init
  runLowContentSearch('');
}

let lastLcData = null;

function filterLcType(type) {
  ['all','Journal','Planner','Tracker','Activity'].forEach(t => {
    const key = t === 'all' ? 'all' : t.toLowerCase();
    document.getElementById(`lc-filter-${key}`).classList.toggle('active', t === type);
  });

  if (!lastLcData) return;
  const filtered = type === 'all' ? lastLcData.ideas : lastLcData.ideas.filter(i => i.type === type);
  renderLcGrid(filtered);
}

async function runLowContentSearch(topic) {
  const out = document.getElementById('lc-results');
  showLoading(out, 'Generating low-content book ideas…');
  try {
    const data = await API.lowcontent.ideas(topic, 24);
    lastLcData = data;
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
