let marketChart = null;

function initMarket() {
  loadMarketOverview();
}

async function loadMarketOverview() {
  const out = document.getElementById('market-results');
  showLoading(out, 'Loading market data…');
  try {
    const data = await API.market.overview();
    renderMarketOverview(data);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderMarketOverview(d) {
  const out = document.getElementById('market-results');

  out.innerHTML = `
    <div class="grid grid-4 mb-4">
      ${mStat('Total KDP Books', d.market_stats.total_kdp_books, '📚')}
      ${mStat('New Books/Month', d.market_stats.monthly_new_books, '📈')}
      ${mStat('Avg Kindle Price', d.market_stats.avg_kindle_price, '💲')}
      ${mStat('KU Titles', d.market_stats.kindle_unlimited_titles, '⭐')}
    </div>

    <div class="grid grid-2 mb-4">
      <div class="card">
        <div class="card-header"><div class="card-title">Category Competition Heatmap</div></div>
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

    <div class="card mb-4">
      <div class="card-header"><div class="card-title">Monthly New Books by Genre</div></div>
      <div class="chart-container" style="height:280px"><canvas id="market-chart"></canvas></div>
    </div>

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

  renderMarketChart(d.categories);
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
  if (marketChart) marketChart.destroy();
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
