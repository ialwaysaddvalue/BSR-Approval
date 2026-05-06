let bsrTrendChart = null;

function initBsr() {
  document.getElementById('bsr-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bsr      = parseInt(document.getElementById('bsr-input').value, 10);
    const category = document.getElementById('bsr-category').value;
    const price    = parseFloat(document.getElementById('bsr-price').value);
    const royalty  = parseFloat(document.getElementById('bsr-royalty').value) / 100;
    if (!bsr || bsr < 1) return;
    await runBsrCalc(bsr, category, price, royalty);
  });

  // Live price/royalty updates
  ['bsr-price','bsr-royalty'].forEach(id => {
    document.getElementById(id).addEventListener('input', debounce(rerunBsr, 600));
  });
}

let lastBsrParams = null;

function rerunBsr() {
  if (!lastBsrParams) return;
  const price   = parseFloat(document.getElementById('bsr-price').value);
  const royalty = parseFloat(document.getElementById('bsr-royalty').value) / 100;
  runBsrCalc(lastBsrParams.bsr, lastBsrParams.category, price, royalty);
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

async function runBsrCalc(bsr, category, price, royalty) {
  lastBsrParams = { bsr, category };
  const output = document.getElementById('bsr-output');
  showLoading(output, 'Calculating sales estimates…');

  try {
    const d = await API.bsr.calculate(bsr, category, price, royalty);
    renderBsrResults(d);
  } catch (err) {
    showError(output, 'Error: ' + err.message);
  }
}

function compLevelColor(level) {
  const map = { 'Extreme': 'red', 'Very High': 'red', 'High': 'yellow', 'Moderate-High': 'yellow', 'Moderate': 'gray', 'Low-Moderate': 'green', 'Low': 'green', 'Very Low': 'green' };
  return map[level] || 'gray';
}

function renderBsrResults(d) {
  const output = document.getElementById('bsr-output');
  const opp = d.opportunity_score;
  const oppColor = scoreColor(opp);
  const compColor = `var(--${compLevelColor(d.competition_level) === 'yellow' ? 'yellow' : compLevelColor(d.competition_level) === 'red' ? 'red' : 'green'})`;

  output.innerHTML = `
    <div class="grid grid-4 mb-4">
      ${statBlock('Daily Sales', d.daily_sales, '📦', '#dbeafe')}
      ${statBlock('Monthly Sales', d.monthly_sales, '📅', '#dcfce7')}
      ${statBlock('Monthly Revenue', fmtMoney(d.revenue.monthly_revenue), '💰', '#fef3c7')}
      ${statBlock('Annual Revenue', fmtMoney(d.revenue.annual_revenue), '🏦', '#f3e8ff')}
    </div>

    <div class="grid grid-2 mb-4">
      <div class="card">
        <div class="card-header"><div><div class="card-title">Competition Analysis</div></div></div>
        <div style="display:flex;align-items:center;gap:20px">
          <div class="score-circle" style="background:${oppColor}22;color:${oppColor}">${opp}</div>
          <div style="flex:1">
            <div class="mb-2">
              <div class="text-xs text-muted mb-1">Opportunity Score</div>
              ${scoreBar(opp)}
            </div>
            <div class="mb-2">
              <div class="text-xs text-muted mb-1">Competition Score</div>
              ${scoreBar(d.competition_score, competitionColor)}
            </div>
            <div class="mt-3">${badge(d.competition_level, compLevelColor(d.competition_level))}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div><div class="card-title">Revenue Breakdown</div></div></div>
        <div class="text-sm">
          ${revenueRow('Price', fmtMoney(d.revenue.price))}
          ${revenueRow('Royalty Rate', Math.round(d.revenue.royalty_rate * 100) + '%')}
          ${revenueRow('Royalty per Sale', fmtMoney(d.revenue.royalty_per_sale))}
          ${revenueRow('Monthly Sales', d.monthly_sales + ' copies')}
          ${revenueRow('Monthly Revenue', fmtMoney(d.revenue.monthly_revenue), true)}
          ${revenueRow('Annual Revenue', fmtMoney(d.revenue.annual_revenue), true)}
        </div>
        <div class="mt-3 text-xs text-muted">Based on ${d.category_name}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><div class="card-title">30-Day BSR Trend Simulation</div><div class="card-subtitle">Illustrative based on rank volatility patterns</div></div>
      </div>
      <div class="chart-container" style="height:200px">
        <canvas id="bsr-trend-chart"></canvas>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header"><div class="card-title">Category Benchmarks</div></div>
      <div class="grid grid-3">
        ${benchmarkBlock('Top 100 threshold', '#' + fmtNum(d.top100_threshold))}
        ${benchmarkBlock('Top 1,000 threshold', '#' + fmtNum(d.top1000_threshold))}
        ${benchmarkBlock('Your rank', '#' + fmtNum(d.bsr), d.in_top_1000 ? 'green' : d.bsr < d.top100_threshold ? 'blue' : 'gray')}
      </div>
    </div>`;

  renderBsrTrend(d.bsr_trend);
}

function statBlock(label, value, icon, bg) {
  return `
    <div class="stat-card">
      <div class="stat-icon" style="background:${bg};font-size:1.2rem">${icon}</div>
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </div>`;
}

function revenueRow(label, value, bold = false) {
  return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
    <span class="text-muted">${label}</span>
    <span ${bold ? 'class="font-bold"' : ''}>${value}</span>
  </div>`;
}

function benchmarkBlock(label, value, color = 'gray') {
  const colors = { green: '#dcfce7', blue: '#dbeafe', gray: '#f1f5f9' };
  return `<div style="text-align:center;padding:14px;background:${colors[color]};border-radius:8px">
    <div class="text-xs text-muted mb-1">${label}</div>
    <div class="font-black" style="font-size:1.3rem">${value}</div>
  </div>`;
}

function renderBsrTrend(trend) {
  const ctx = document.getElementById('bsr-trend-chart');
  if (!ctx) return;
  if (bsrTrendChart) bsrTrendChart.destroy();
  bsrTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trend.map(t => 'Day ' + t.day),
      datasets: [{
        label: 'BSR',
        data: trend.map(t => t.bsr),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { reverse: true, title: { display: true, text: 'BSR (lower = better)' } },
        x: { ticks: { maxTicksLimit: 10 } },
      },
    },
  });
}
