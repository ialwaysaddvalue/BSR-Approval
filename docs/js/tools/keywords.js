let kwChart = null;

function initKeywords() {
  document.getElementById('kw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = document.getElementById('kw-input').value.trim();
    if (!q) return;
    await runKeywordResearch(q);
  });
}

async function runKeywordResearch(q) {
  const results = document.getElementById('kw-results');
  const summary = document.getElementById('kw-summary');
  showLoading(results, 'Researching keywords on Amazon…');
  summary.classList.add('hidden');

  try {
    const data = await API.keywords.analyze(q);

    // Update summary strip
    const s = data.summary;
    document.getElementById('kw-stat-searches').textContent = fmtNum(s.total_monthly_searches);
    document.getElementById('kw-stat-competition').textContent = s.avg_competition_score;
    document.getElementById('kw-stat-opportunity').textContent = s.opportunity_score;
    document.getElementById('kw-stat-cpc').textContent = fmtMoney(s.avg_cpc);
    document.getElementById('kw-stat-count').textContent = s.keyword_count;
    document.getElementById('kw-stat-ads').textContent = s.kdp_ads_recommended ? 'Yes ✓' : 'Borderline';
    summary.classList.remove('hidden');

    // Render chart (canvas stays in summary div, safe from innerHTML replacement)
    renderKwChart(data.keywords.slice(0, 12));

    // Render tabs + tables into results
    results.innerHTML = `
      <div class="tabs" id="kw-tabs">
        <button class="tab-btn active" onclick="kwSwitchTab('all',this)">All Keywords (${data.keywords.length})</button>
        <button class="tab-btn" onclick="kwSwitchTab('long',this)">Long Tail (${data.long_tail.length})</button>
        <button class="tab-btn" onclick="kwSwitchTab('broad',this)">Broad (${data.broad.length})</button>
      </div>
      <div id="kw-panel-all">${buildKwTable(data.keywords)}</div>
      <div id="kw-panel-long" class="hidden">${buildKwTable(data.long_tail)}</div>
      <div id="kw-panel-broad" class="hidden">${buildKwTable(data.broad)}</div>`;
  } catch (err) {
    showError(results, 'Error: ' + err.message);
    summary.classList.add('hidden');
  }
}

function kwSwitchTab(tab, btn) {
  ['all','long','broad'].forEach(t => {
    document.getElementById(`kw-panel-${t}`).classList.toggle('hidden', t !== tab);
  });
  btn.closest('#kw-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function buildKwTable(keywords) {
  if (!keywords || keywords.length === 0)
    return '<p class="text-muted text-sm" style="padding:16px">No keywords in this group.</p>';
  return `
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Keyword</th>
            <th>Est. Searches/mo</th>
            <th>Competition</th>
            <th>Opportunity</th>
            <th>Avg CPC</th>
            <th>Type</th>
          </tr></thead>
          <tbody>
            ${keywords.map(k => `
              <tr>
                <td class="font-bold">${escHtml(k.keyword)}</td>
                <td>${fmtNum(k.estimated_monthly_searches)}</td>
                <td>${scoreBar(k.competition_score, competitionColor)}</td>
                <td>${scoreBar(k.opportunity_score)}</td>
                <td>$${k.avg_cpc.toFixed(2)}</td>
                <td>${badge(k.type === 'long_tail' ? 'Long Tail' : 'Broad', k.type === 'long_tail' ? 'blue' : 'gray')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderKwChart(keywords) {
  const ctx = document.getElementById('kw-chart');
  if (!ctx) return;
  if (kwChart) kwChart.destroy();
  kwChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: keywords.map(k => k.keyword.length > 22 ? k.keyword.slice(0, 22) + '…' : k.keyword),
      datasets: [
        {
          label: 'Est. Monthly Searches',
          data: keywords.map(k => k.estimated_monthly_searches),
          backgroundColor: 'rgba(59,130,246,0.75)',
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'Competition Score',
          data: keywords.map(k => k.competition_score),
          backgroundColor: 'rgba(245,158,11,0.75)',
          borderRadius: 4,
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        y:  { type: 'linear', position: 'left',  title: { display: true, text: 'Monthly Searches' } },
        y2: { type: 'linear', position: 'right', title: { display: true, text: 'Competition (0-100)' }, min: 0, max: 100, grid: { drawOnChartArea: false } },
      },
    },
  });
}
