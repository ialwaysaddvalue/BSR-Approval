function initAds() {
  document.getElementById('ads-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q      = document.getElementById('ads-input').value.trim();
    const budget = parseFloat(document.getElementById('ads-budget').value) || 10;
    if (!q) return;
    await runAdsResearch(q, budget);
  });
}

async function runAdsResearch(q, budget) {
  const out = document.getElementById('ads-results');
  showLoading(out, 'Generating KDP ad keyword recommendations…');
  try {
    const data = await API.ads.keywords(q, budget);
    renderAdsResults(data);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderAdsResults(d) {
  const out = document.getElementById('ads-results');

  const byMatch = { Broad: [], Phrase: [], Exact: [] };
  d.keywords.forEach(k => (byMatch[k.match_type] || []).push(k));

  out.innerHTML = `
    <div class="alert alert-info mb-4">
      <strong>Campaign Tip:</strong> ${escHtml(d.campaign_tip)}
    </div>

    <div class="grid grid-3 mb-4">
      ${matchSummaryCard('Broad Match', byMatch.Broad.length, 'Discovery & reach', '#dbeafe')}
      ${matchSummaryCard('Phrase Match', byMatch.Phrase.length, 'Balanced targeting', '#dcfce7')}
      ${matchSummaryCard('Exact Match', byMatch.Exact.length, 'ACOS control', '#fef3c7')}
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchAdsTab('all',this)">All Keywords</button>
      <button class="tab-btn" onclick="switchAdsTab('broad',this)">Broad</button>
      <button class="tab-btn" onclick="switchAdsTab('phrase',this)">Phrase</button>
      <button class="tab-btn" onclick="switchAdsTab('exact',this)">Exact</button>
    </div>

    <div id="ads-tab-all">${adsTable(d.keywords, d.daily_budget)}</div>
    <div id="ads-tab-broad" class="hidden">${adsTable(byMatch.Broad, d.daily_budget)}</div>
    <div id="ads-tab-phrase" class="hidden">${adsTable(byMatch.Phrase, d.daily_budget)}</div>
    <div id="ads-tab-exact" class="hidden">${adsTable(byMatch.Exact, d.daily_budget)}</div>`;
}

function switchAdsTab(tab, btn) {
  ['all','broad','phrase','exact'].forEach(t => {
    document.getElementById(`ads-tab-${t}`).classList.toggle('hidden', t !== tab);
  });
  btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function matchSummaryCard(title, count, desc, bg) {
  return `<div class="stat-card" style="background:${bg}">
    <div class="stat-label">${title}</div>
    <div class="stat-value">${count}</div>
    <div class="stat-change">${desc}</div>
  </div>`;
}

function adsTable(keywords, budget) {
  if (!keywords || keywords.length === 0) return '<p class="text-muted text-sm p-4">No keywords in this group.</p>';
  return `
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Keyword</th>
            <th>Match Type</th>
            <th>Min Bid</th>
            <th>Suggested Bid</th>
            <th>Max Bid</th>
            <th>Est. Clicks/day</th>
            <th>Competition</th>
            <th>Relevance</th>
          </tr></thead>
          <tbody>
            ${keywords.map(k => `
              <tr>
                <td class="font-bold">${escHtml(k.keyword)}</td>
                <td>${badge(k.match_type, k.match_type === 'Exact' ? 'blue' : k.match_type === 'Phrase' ? 'green' : 'gray')}</td>
                <td>$${k.bid_low.toFixed(2)}</td>
                <td><strong>$${k.bid_suggested.toFixed(2)}</strong></td>
                <td>$${k.bid_high.toFixed(2)}</td>
                <td>${k.est_daily_clicks}</td>
                <td>${badge(k.competition, k.competition === 'Low' ? 'green' : k.competition === 'High' ? 'red' : 'yellow')}</td>
                <td>${scoreBar(k.relevance_score)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
