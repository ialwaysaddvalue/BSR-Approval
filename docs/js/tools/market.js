// ── Market Overview ──────────────────────────────────────────────────────────
// Loaded lazily — initMarket() is NOT called on DOMContentLoaded.
// navigate() calls loadMarketOverview() on first visit, rerenderMarketChart() on re-visits.

let marketChart = null;
let lastMarketData = null;

// Called by app.js navigate() on first visit
async function loadMarketOverview() {
  const out = document.getElementById('market-results');
  showLoading(out, 'Loading market data…');
  try {
    const data = await API.market.overview();
    lastMarketData = data;
    renderMarketOverview(data);
  } catch (err) {
    showError(out, err.message);
  }
}

// Called by navigate() on subsequent visits to re-render chart (canvas may have been hidden)
function rerenderMarketChart() {
  if (lastMarketData) {
    // Small delay ensures the panel is visible before Chart.js measures dimensions
    setTimeout(() => renderMarketChart(lastMarketData.categories), 50);
  }
}

function renderMarketOverview(d) {
  const out = document.getElementById('market-results');

  out.innerHTML = `
    <!-- ── Stats ── -->
    <div class="grid grid-4 mb-4">
      ${mStat('Total KDP Books', d.market_stats.total_kdp_books, '📚')}
      ${mStat('New Books/Month', d.market_stats.monthly_new_books, '📈')}
      ${mStat('Avg Kindle Price', d.market_stats.avg_kindle_price, '💲')}
      ${mStat('KU Titles', d.market_stats.kindle_unlimited_titles, '⭐')}
    </div>

    <!-- ── Competition heatmap + Opportunities ── -->
    <div class="grid grid-2 mb-4">
      <div class="card">
        <div class="card-header"><div class="card-title">Category Competition Heatmap</div><div class="card-subtitle">Red = high competition | Green = opportunity</div></div>
        <div id="market-bars">
          ${d.categories.map(c => `
            <div class="market-bar">
              <div class="market-bar-name" title="${escHtml(c.name)}">${escHtml(c.name)}</div>
              <div class="market-bar-track">
                <div class="market-bar-fill" style="width:${c.competition_score}%;background:${competitionColor(c.competition_score)}"></div>
              </div>
              <div class="market-bar-score">${c.competition_score}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Top Opportunities Right Now</div></div>
        <ul class="opportunity-list">
          ${d.top_opportunities.map((o, i) => `
            <li>
              <div class="opp-num">${i + 1}</div>
              <div class="opp-text">
                <strong>${escHtml(o.niche)}</strong>
                <span>${escHtml(o.reason)}</span>
              </div>
            </li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- ── Bar chart ── -->
    <div class="card mb-4">
      <div class="card-header"><div class="card-title">Monthly New Books by Genre</div><div class="card-subtitle">Estimated new titles published per month per category</div></div>
      <div class="chart-container" style="height:280px"><canvas id="market-chart"></canvas></div>
    </div>

    <!-- ── Seasonality ── -->
    <div class="card mb-4">
      <div class="card-header">
        <div>
          <div class="card-title">📅 Seasonality Guide — Best Months to Publish by Genre</div>
          <div class="card-subtitle">Blue = peak season | Light blue = good | Gray = normal</div>
        </div>
      </div>
      ${renderSeasonalityGrid()}
    </div>

    <!-- ── Full table ── -->
    <div class="card">
      <div class="card-header"><div class="card-title">Full Category Intelligence</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Category</th>
            <th>Competition</th>
            <th>Trend</th>
            <th>Revenue Potential</th>
            <th>Monthly New Books</th>
          </tr></thead>
          <tbody>
            ${d.categories.map(c => `
              <tr>
                <td class="font-bold">${escHtml(c.name)}</td>
                <td>${scoreBar(c.competition_score, competitionColor)}</td>
                <td>${trendBadge(c.trend)}</td>
                <td>${badge(c.revenue_potential, c.revenue_potential === 'Very High' ? 'green' : c.revenue_potential === 'High' ? 'blue' : 'gray')}</td>
                <td>${fmtNum(c.monthly_books_published)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  // Render chart after DOM is ready — use setTimeout to ensure canvas is visible
  setTimeout(() => renderMarketChart(d.categories), 50);
}

// ── Seasonality data ──────────────────────────────────────────────────────────
const SEASONALITY = [
  {
    genre: 'Romance',
    months: [2,2, 1,0, 0,0, 0,0, 0,0, 2,2],
    tip: 'Valentine's Day (Feb) and holiday reads (Nov–Dec) drive peak sales. Launch clean romance in Jan.',
  },
  {
    genre: 'Mystery / Thriller',
    months: [2,2, 2,0, 0,0, 0,0, 0,1, 2,1],
    tip: 'Winter and fall reading seasons. October (spooky season) is a strong window.',
  },
  {
    genre: 'Self-Help',
    months: [2,1, 0,0, 0,0, 0,0, 2,1, 0,0],
    tip: 'New Year resolutions (Jan) and back-to-school self-improvement (Sep) are the two peak windows.',
  },
  {
    genre: 'Business / Finance',
    months: [2,1, 0,0, 0,0, 0,0, 2,2, 0,0],
    tip: 'Jan (new year goals) and Sep–Oct (Q4 planning) are top buying seasons for business books.',
  },
  {
    genre: "Children's Books",
    months: [0,0, 0,0, 0,0, 0,2, 2,0, 2,2],
    tip: 'Back-to-school (Aug–Sep) and holiday gifting (Nov–Dec) are the highest-volume windows.',
  },
  {
    genre: 'Low-Content Books',
    months: [2,0, 0,0, 0,0, 0,0, 2,0, 2,2],
    tip: 'Jan (New Year planners & habit trackers), Sep (academic planners), and holiday gifts (Nov–Dec).',
  },
  {
    genre: 'Health & Fitness',
    months: [2,2, 1,0, 0,0, 0,0, 2,0, 0,0],
    tip: 'New Year health goals (Jan–Feb) and back-to-health season (Sep) are the biggest spikes.',
  },
  {
    genre: 'Cookbooks',
    months: [0,0, 0,0, 0,0, 0,0, 0,1, 2,2],
    tip: 'Holiday cooking and gifting season (Nov–Dec) is by far the biggest window for cookbooks.',
  },
];

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderSeasonalityGrid() {
  const headerRow = `
    <div class="seasonality-grid" style="margin-bottom:4px">
      <div class="s-genre text-muted"></div>
      ${MONTH_LABELS.map(m => `<div class="seasonality-header">${m}</div>`).join('')}
    </div>`;

  const rows = SEASONALITY.map(row => {
    const cells = row.months.map(level => {
      const cls = level === 2 ? 'peak' : level === 1 ? 'good' : 'normal';
      const label = level === 2 ? '●' : level === 1 ? '◑' : '';
      return `<div class="s-month ${cls}" title="${level === 2 ? 'Peak season' : level === 1 ? 'Good season' : 'Normal'}">${label}</div>`;
    }).join('');
    return `
      <div class="seasonality-grid mb-1" title="${escHtml(row.tip)}">
        <div class="s-genre">${escHtml(row.genre)}</div>
        ${cells}
      </div>`;
  }).join('');

  const legend = `
    <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap">
      <span style="font-size:.72rem;color:var(--text-muted);display:flex;align-items:center;gap:5px"><span class="s-month peak" style="width:20px;height:20px;display:inline-flex">●</span> Peak season</span>
      <span style="font-size:.72rem;color:var(--text-muted);display:flex;align-items:center;gap:5px"><span class="s-month good" style="width:20px;height:20px;display:inline-flex">◑</span> Good season</span>
      <span style="font-size:.72rem;color:var(--text-muted);display:flex;align-items:center;gap:5px"><span class="s-month normal" style="width:20px;height:20px;display:inline-flex"></span> Normal</span>
      <span style="font-size:.72rem;color:var(--text-muted)">Hover over a row for publishing tip</span>
    </div>`;

  return headerRow + rows + legend;
}

function mStat(label, value, icon) {
  return `<div class="stat-card">
    <div class="stat-icon" style="background:#f1f5f9;font-size:1.3rem">${icon}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-value" style="font-size:1.4rem">${value}</div>
  </div>`;
}

function renderMarketChart(categories) {
  const ctx = document.getElementById('market-chart');
  if (!ctx) return;
  if (marketChart) { marketChart.destroy(); marketChart = null; }
  const top = categories.slice(0, 10);
  marketChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(c => c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name),
      datasets: [{
        label: 'Monthly New Books',
        data: top.map(c => c.monthly_books_published),
        backgroundColor: top.map(c => {
          if (c.competition_score >= 80) return 'rgba(239,68,68,0.75)';
          if (c.competition_score >= 60) return 'rgba(245,158,11,0.75)';
          return 'rgba(16,185,129,0.75)';
        }),
        borderRadius: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { title: { display: true, text: 'New Books per Month' } } },
    },
  });
}
