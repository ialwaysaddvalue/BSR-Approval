async function initDashboard() {
  try {
    const data = await API.market.overview();
    renderDashboard(data);
  } catch (err) {
    document.getElementById('dashboard-content').innerHTML =
      `<div class="alert alert-warning">Could not load market data: ${err.message}</div>`;
  }
}

function renderDashboard(d) {
  const el = document.getElementById('dashboard-content');
  el.innerHTML = `
    <div class="grid grid-4 mb-4">
      ${dashStat('📚', 'Total KDP Books', d.market_stats.total_kdp_books, 'Growing monthly', 'up')}
      ${dashStat('📦', 'New Books/Month', d.market_stats.monthly_new_books, 'Stay ahead of the curve', '')}
      ${dashStat('💲', 'Avg Kindle Price', d.market_stats.avg_kindle_price, 'Optimal pricing range', '')}
      ${dashStat('⭐', 'KU Titles', d.market_stats.kindle_unlimited_titles, 'Unlimited pool', 'up')}
    </div>

    <div class="grid grid-2 mb-4">
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">🔥 Top Market Opportunities</div><div class="card-subtitle">Highest opportunity niches right now</div></div>
        </div>
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

      <div class="card">
        <div class="card-header"><div class="card-title">🧭 Quick Tool Access</div></div>
        <div class="grid grid-2" style="gap:10px">
          ${quickTool('🔑', 'Keyword Research', 'Find high-value keywords', 'tool-keywords')}
          ${quickTool('📊', 'BSR Calculator', 'Estimate sales from BSR', 'tool-bsr')}
          ${quickTool('📂', 'Category Explorer', 'Find low-competition niches', 'tool-categories')}
          ${quickTool('🎯', 'Niche Finder', 'Discover profitable niches', 'tool-niche')}
          ${quickTool('📣', 'KDP Ads Keywords', 'Optimize ad campaigns', 'tool-ads')}
          ${quickTool('📓', 'Low-Content Ideas', 'Journals, planners & more', 'tool-lowcontent')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">📈 Category Competition Overview</div><div class="card-subtitle">Red = high competition | Green = opportunity</div></div>
      <div style="column-count:2;column-gap:24px">
        ${d.categories.slice(0, 12).map(c => `
          <div class="market-bar" style="break-inside:avoid;margin-bottom:10px">
            <div class="market-bar-name" title="${escHtml(c.name)}">${escHtml(c.name)}</div>
            <div class="market-bar-track">
              <div class="market-bar-fill" style="width:${c.competition_score}%;background:${competitionColor(c.competition_score)}"></div>
            </div>
            <div class="market-bar-score">${c.competition_score}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function dashStat(icon, label, value, change, dir) {
  return `<div class="stat-card">
    <div class="stat-icon" style="background:#f1f5f9;font-size:1.2rem">${icon}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-value" style="font-size:1.5rem">${value}</div>
    <div class="stat-change ${dir}">${change}</div>
  </div>`;
}

function quickTool(icon, title, desc, navTarget) {
  return `<div class="card" style="cursor:pointer;padding:14px;border:1.5px solid var(--border)"
      onclick="navigate('${navTarget}')">
    <div style="font-size:1.4rem;margin-bottom:6px">${icon}</div>
    <div class="font-bold text-sm">${title}</div>
    <div class="text-xs text-muted">${desc}</div>
  </div>`;
}
