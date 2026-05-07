let nicheChart = null;

function initNiche() {
  document.getElementById('niche-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = document.getElementById('niche-input').value.trim();
    if (!q) return;
    await runNicheSearch(q);
  });

  document.getElementById('niche-view-grid').addEventListener('click',  () => setNicheView('grid'));
  document.getElementById('niche-view-table').addEventListener('click', () => setNicheView('table'));
  document.getElementById('niche-view-chart').addEventListener('click', () => setNicheView('chart'));
}

let lastNicheData = null;
let currentNicheView = 'grid';

function setNicheView(view) {
  currentNicheView = view;
  ['grid','table','chart'].forEach(v => {
    document.getElementById(`niche-view-${v}`).classList.toggle('active', v === view);
  });
  if (lastNicheData) renderNicheResults(lastNicheData);
}

async function runNicheSearch(q) {
  const out = document.getElementById('niche-results');
  showLoading(out, 'Analyzing niche opportunities…');
  try {
    const data = await API.niche.search(q, 15);
    lastNicheData = data;
    renderNicheResults(data);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderNicheResults(data) {
  const out = document.getElementById('niche-results');

  if (!data.niches || data.niches.length === 0) {
    showEmpty(out, '🔍', 'No niches found', 'Try a different search term');
    return;
  }

  const best = data.best_niche;
  const headerHtml = best ? `
    <div class="alert alert-success mb-4">
      <strong>Top Pick:</strong> "${escHtml(best.niche)}" — Opportunity Score: ${best.opportunity_score}/100 | ${best.recommendation}
    </div>` : '';

  if (currentNicheView === 'grid') {
    out.innerHTML = headerHtml + `
      <div class="niche-grid">
        ${data.niches.map(n => nicheCard(n)).join('')}
      </div>`;
  } else if (currentNicheView === 'table') {
    out.innerHTML = headerHtml + nicheTable(data.niches);
  } else {
    out.innerHTML = headerHtml + `
      <div class="card">
        <div class="card-header"><div class="card-title">Demand vs. Competition Matrix</div><div class="card-subtitle">Upper-left = best opportunities</div></div>
        <div class="chart-container" style="height:380px"><canvas id="niche-scatter-chart"></canvas></div>
      </div>`;
    // Delay ensures canvas is in DOM and panel is visible before Chart.js renders
    setTimeout(() => renderNicheChart(data.niches), 50);
  }
}

function nicheCard(n) {
  return `
    <div class="niche-card tier-${n.tier}">
      <div class="niche-card-name">${escHtml(n.niche)}</div>
      <div class="niche-metrics">
        <div class="niche-metric">
          <div class="niche-metric-value" style="color:${scoreColor(n.opportunity_score)}">${n.opportunity_score}</div>
          <div class="niche-metric-label">Opportunity</div>
        </div>
        <div class="niche-metric">
          <div class="niche-metric-value" style="color:${competitionColor(n.competition_score)}">${n.competition_score}</div>
          <div class="niche-metric-label">Competition</div>
        </div>
        <div class="niche-metric">
          <div class="niche-metric-value">${n.demand_score}</div>
          <div class="niche-metric-label">Demand</div>
        </div>
        <div class="niche-metric">
          <div class="niche-metric-value">${fmtNum(n.estimated_books_in_niche)}</div>
          <div class="niche-metric-label">Books</div>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
        ${tierBadge(n.tier)}
        ${trendBadge(n.trend)}
        <span class="badge badge-gray">~${n.avg_reviews_top_10} avg reviews</span>
      </div>
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="action-btn" onclick="nicheToKeywords(${JSON.stringify(escHtml(n.niche))})">🔑 Find Keywords</button>
        <button class="action-btn" onclick="nicheToCategories(${JSON.stringify(escHtml(n.niche))})">→ See in Categories</button>
      </div>
    </div>`;
}

function nicheToKeywords(nicheName) {
  navigate('keywords');
  const input = document.getElementById('kw-input');
  if (input) {
    input.value = nicheName;
    setTimeout(() => runKeywordResearch(nicheName), 100);
  }
}

function nicheToCategories(nicheName) {
  navigate('categories');
  // Categories shows the full list — user can then browse from there
}

function nicheTable(niches) {
  return `
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Niche</th>
            <th>Opportunity</th>
            <th>Demand</th>
            <th>Competition</th>
            <th>Books in Niche</th>
            <th>Avg Reviews (Top 10)</th>
            <th>Avg Price</th>
            <th>Trend</th>
            <th>Verdict</th>
          </tr></thead>
          <tbody>
            ${niches.map(n => `
              <tr>
                <td class="font-bold">${escHtml(n.niche)}</td>
                <td>${scoreBar(n.opportunity_score)}</td>
                <td>${scoreBar(n.demand_score)}</td>
                <td>${scoreBar(n.competition_score, competitionColor)}</td>
                <td>${fmtNum(n.estimated_books_in_niche)}</td>
                <td>${n.avg_reviews_top_10}</td>
                <td>$${n.avg_price_top_10.toFixed(2)}</td>
                <td>${trendBadge(n.trend)}</td>
                <td>${tierBadge(n.tier)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderNicheChart(niches) {
  const ctx = document.getElementById('niche-scatter-chart');
  if (!ctx) return;
  if (nicheChart) { nicheChart.destroy(); nicheChart = null; }

  const colorMap = { Green: 'rgba(16,185,129,0.8)', Yellow: 'rgba(245,158,11,0.8)', Red: 'rgba(239,68,68,0.8)' };

  nicheChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Niches',
        data: niches.map(n => ({ x: n.competition_score, y: n.demand_score, label: n.niche, tier: n.tier })),
        backgroundColor: niches.map(n => colorMap[n.tier] || 'rgba(100,116,139,0.8)'),
        pointRadius: 10,
        pointHoverRadius: 13,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const p = ctx.raw;
              return [`"${p.label}"`, `Competition: ${p.x}`, `Demand: ${p.y}`];
            },
          },
        },
      },
      scales: {
        x: { min: 0, max: 100, title: { display: true, text: 'Competition Score →' } },
        y: { min: 0, max: 100, title: { display: true, text: '← Demand Score' } },
      },
    },
  });
}
