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

async function runBookAnalysis(asin) {
  const out = document.getElementById('book-results');
  showLoading(out, `Analyzing ASIN ${asin}…`);
  try {
    const d = await API.book.analyze(asin);
    renderBookResults(d);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderBookResults(d) {
  const out = document.getElementById('book-results');
  const opp = d.opportunity_score;
  const oppColor = scoreColor(opp);

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

      <div class="grid grid-2">
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
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Estimated Categories</div></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${d.categories.map(c => `<span class="badge badge-blue">${escHtml(c)}</span>`).join('')}
      </div>
    </div>`;
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
