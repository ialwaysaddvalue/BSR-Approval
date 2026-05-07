function initBook() {
  document.getElementById('book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const asin = document.getElementById('book-asin').value.trim().toUpperCase();
    if (!asin || asin.length !== 10) {
      showError(document.getElementById('book-results'), 'Please enter a valid 10-character ASIN.');
      return;
    }
    await runBookAnalysis(asin);
  });
}

let lastBookData = null;

async function runBookAnalysis(asin) {
  const out = document.getElementById('book-results');
  showLoading(out, `Analyzing ASIN ${asin}…`);
  try {
    const d = await API.book.analyze(asin);
    lastBookData = d;
    renderBookResults(d);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderBookResults(d) {
  const out = document.getElementById('book-results');
  const opp = d.opportunity_score;
  const oppColor = scoreColor(opp);
  const firstCategory = d.categories && d.categories.length > 0 ? d.categories[0] : '';

  out.innerHTML = `
    <div class="card mb-4">
      <div class="card-header">
        <div>
          <div class="card-title">ASIN: ${escHtml(d.asin)}</div>
          <div class="card-subtitle">${d.note}</div>
        </div>
        <div class="score-circle" style="background:${oppColor}22;color:${oppColor};width:80px;height:80px;font-size:1.5rem">${opp}</div>
      </div>

      <div class="grid grid-4 mb-4">
        ${bStatBlock('Est. BSR', '#' + fmtNum(d.estimated_bsr))}
        ${bStatBlock('Category BSR', '#' + fmtNum(d.estimated_category_bsr))}
        ${bStatBlock('Monthly Sales', '~' + d.estimated_monthly_sales)}
        ${bStatBlock('Monthly Revenue', fmtMoney(d.estimated_monthly_revenue))}
      </div>

      <div class="grid grid-2 mb-4">
        <div>
          <div class="text-xs text-muted mb-1">Opportunity Score</div>
          ${scoreBar(d.opportunity_score)}
          <div class="text-xs text-muted mt-2 mb-1">Competition Score</div>
          ${scoreBar(d.competition_score, competitionColor)}
        </div>
        <div class="text-sm">
          ${bookRow('Est. Review Count', d.review_count)}
          ${bookRow('Avg Rating', d.avg_rating + ' ★')}
          ${bookRow('Est. Price', fmtMoney(d.estimated_price))}
          ${bookRow('Page Count', d.page_count + ' pages')}
        </div>
      </div>

      <!-- Action buttons -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;padding-top:14px;border-top:1px solid var(--border)">
        <button class="btn btn-ghost btn-sm" onclick="bookResearchNiche(${JSON.stringify(escHtml(firstCategory))})">
          🔍 Research this niche
        </button>
        <button class="btn btn-ghost btn-sm" onclick="bookFindKeywords(${JSON.stringify(escHtml(firstCategory))})">
          🔑 Find keywords for this niche
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Estimated Categories</div></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${d.categories.map(c => `<span class="badge badge-blue">${escHtml(c)}</span>`).join('')}
      </div>
      <div class="text-xs text-muted mt-3">
        Use the Category Explorer to drill into these categories and find sub-niches with lower competition.
      </div>
    </div>`;
}

function bookResearchNiche(categoryName) {
  if (!categoryName) { navigate('niche'); return; }
  navigate('niche');
  const input = document.getElementById('niche-input');
  if (input) {
    input.value = categoryName;
    setTimeout(() => runNicheSearch(categoryName), 100);
  }
}

function bookFindKeywords(categoryName) {
  if (!categoryName) { navigate('keywords'); return; }
  navigate('keywords');
  const input = document.getElementById('kw-input');
  if (input) {
    input.value = categoryName;
    setTimeout(() => runKeywordResearch(categoryName), 100);
  }
}

function bStatBlock(label, value) {
  return `<div class="stat-card">
    <div class="stat-label">${label}</div>
    <div class="stat-value" style="font-size:1.3rem">${value}</div>
  </div>`;
}

function bookRow(label, value) {
  return `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
    <span class="text-muted">${label}</span>
    <span class="font-bold">${value}</span>
  </div>`;
}
