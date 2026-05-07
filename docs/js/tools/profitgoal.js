function initProfitGoal() {
  document.getElementById('pg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const target  = parseFloat(document.getElementById('pg-target').value);
    const price   = parseFloat(document.getElementById('pg-price').value);
    const royalty = parseFloat(document.getElementById('pg-royalty').value) / 100;
    const books   = parseInt(document.getElementById('pg-books').value, 10);
    if (!target) return;
    await runProfitGoal(target, price, royalty, books);
  });
}

async function runProfitGoal(target, price, royalty, books) {
  const out = document.getElementById('pg-results');
  showLoading(out, 'Calculating your path to profitability…');
  try {
    const data = await API.profitGoal(target, price, royalty, books);
    renderProfitGoal(data);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderProfitGoal(d) {
  const out = document.getElementById('pg-results');
  const g = d.goal;
  const achColor = scoreColor(g.achievability_score);
  const royaltyPer = g.royalty_per_book;

  out.innerHTML = `
    <!-- ── Goal Summary ── -->
    <div class="card mb-4" style="border-left:4px solid ${achColor}">
      <div class="card-header">
        <div>
          <div class="card-title" style="font-size:1.1rem">Your Path to ${fmtMoney(g.monthly_target)}/month</div>
          <div class="card-subtitle">${escHtml(g.summary)}</div>
        </div>
        <div class="score-circle" style="background:${achColor}22;color:${achColor};width:80px;height:80px;font-size:1.1rem;text-align:center;line-height:1.2;flex-direction:column;gap:2px">
          <div style="font-size:1.5rem;font-weight:900">${g.achievability_score}</div>
          <div style="font-size:.6rem;font-weight:700;text-transform:uppercase">${g.achievability}</div>
        </div>
      </div>
      <div class="grid grid-4">
        ${pgStat('Monthly Target', fmtMoney(g.monthly_target), '🎯')}
        ${pgStat('Copies Needed Total', g.total_copies_needed_monthly + '/mo', '📦')}
        ${pgStat('Per Book', g.copies_per_book_per_month + ' copies/mo', '📚')}
        ${pgStat('Required BSR/book', '#' + fmtNum(g.required_bsr_per_book), '📊')}
      </div>
      <div class="grid grid-3 mt-3">
        ${pgStat('Your Price', fmtMoney(g.price), '💲')}
        ${pgStat('Royalty/Sale', fmtMoney(g.royalty_per_book), '💰')}
        ${pgStat('Books in Portfolio', g.books_in_portfolio, '📖')}
      </div>
    </div>

    <!-- ── Scenario Comparison ── -->
    ${renderScenarioComparison(g.monthly_target, g.price, royaltyPer)}

    <!-- ── Top Genre Picks ── -->
    <div class="card mb-4">
      <div class="card-header">
        <div>
          <div class="card-title">Best Genres for Your Goal</div>
          <div class="card-subtitle">Ranked by how achievable your target BSR is in each genre</div>
        </div>
      </div>
      ${d.top_genres.map((genre, i) => genreBlock(genre, i, g)).join('')}
    </div>

    <!-- ── All Genres Table ── -->
    <div class="card">
      <div class="card-header"><div class="card-title">All Genres Ranked</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>#</th><th>Genre</th><th>Fit for Goal</th><th>Competition</th>
            <th>Trend</th><th>Series?</th><th>KU?</th><th>Avg. Write Time</th>
          </tr></thead>
          <tbody>
            ${d.all_genres.map((g2, i) => `
              <tr>
                <td class="font-bold">${i + 1}</td>
                <td class="font-bold">${escHtml(g2.genre)}</td>
                <td>${scoreBar(g2.fit_score)}</td>
                <td>${scoreBar(g2.competition_score, competitionColor)}</td>
                <td>${trendBadge(g2.trend)}</td>
                <td>${g2.series_potential === 'Very High' ? badge('Very High', 'green') : badge(g2.series_potential, 'blue')}</td>
                <td>${g2.ku_compatible ? badge('KU ✓', 'green') : badge('No KU', 'gray')}</td>
                <td>${g2.avg_weeks_to_write} wks</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ── Scenario Comparison ───────────────────────────────────────────────────────
function renderScenarioComparison(monthlyTarget, price, royaltyPer) {
  const counts = [1, 3, 5, 10];
  const a = 7440, b = 0.699;

  function calcScenario(numBooks) {
    const copiesPerBook = Math.ceil(monthlyTarget / (royaltyPer * numBooks));
    const requiredBsr   = copiesPerBook <= 0 ? 9999999 : Math.round(Math.pow(copiesPerBook / a, -1 / b));
    let achievability;
    if      (requiredBsr <  1000) achievability = { label: 'Very Hard',  color: 'var(--red)',    score: 20 };
    else if (requiredBsr <  3000) achievability = { label: 'Hard',       color: 'var(--red)',    score: 40 };
    else if (requiredBsr <  8000) achievability = { label: 'Moderate',   color: 'var(--yellow)', score: 60 };
    else if (requiredBsr < 25000) achievability = { label: 'Achievable', color: 'var(--green)',  score: 80 };
    else                          achievability = { label: 'Easy',       color: 'var(--green)',  score: 95 };
    return { numBooks, copiesPerBook, requiredBsr, achievability };
  }

  const rows = counts.map(n => {
    const s = calcScenario(n);
    return `<tr>
      <td class="font-bold text-center">${s.numBooks} book${s.numBooks > 1 ? 's' : ''}</td>
      <td class="text-center">${s.copiesPerBook} copies/mo per book</td>
      <td class="text-center font-bold">#${fmtNum(s.requiredBsr)}</td>
      <td class="text-center">
        <span style="font-weight:700;color:${s.achievability.color}">${s.achievability.label}</span>
      </td>
    </tr>`;
  }).join('');

  return `
    <div class="card mb-4">
      <div class="card-header">
        <div>
          <div class="card-title">📊 Scenario Comparison</div>
          <div class="card-subtitle">Same ${fmtMoney(monthlyTarget)}/mo target at ${fmtMoney(price)} price — how many books changes everything</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th style="text-align:center">Portfolio Size</th>
            <th style="text-align:center">Sales Required per Book</th>
            <th style="text-align:center">BSR Required per Book</th>
            <th style="text-align:center">Achievability</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="text-xs text-muted mt-3" style="padding:0 4px">
        Publishing more books lowers the BSR required per book, making the goal much more achievable. A portfolio of 5-10 books is the sweet spot for most new authors.
      </div>
    </div>`;
}

// ── Genre Block ───────────────────────────────────────────────────────────────
function genreBlock(genre, index, goal) {
  const fitColor = scoreColor(genre.fit_score);
  const timeToFirstDollar = genre.avg_weeks_to_write + 6; // write time + ~4-8 wks to publish & rank (avg 6)
  return `
    <div style="border:1.5px solid var(--border);border-radius:10px;padding:18px;margin-bottom:14px${index === 0 ? ';border-color:var(--green);background:#f0fdf4' : ''}">
      <div style="display:flex;align-items:flex-start;gap:16px">
        <div style="min-width:52px;text-align:center">
          <div style="font-size:1.5rem;font-weight:900;color:${fitColor}">${genre.fit_score}</div>
          <div style="font-size:.65rem;text-transform:uppercase;color:var(--text-muted)">Fit Score</div>
        </div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-size:.95rem;font-weight:800">${index + 1}. ${escHtml(genre.genre)}</span>
            ${index === 0 ? badge('Top Pick', 'green') : ''}
            ${trendBadge(genre.trend)}
            ${genre.ku_compatible ? badge('KU Compatible', 'blue') : ''}
            ${badge(genre.series_potential + ' Series Potential', 'gray')}
          </div>
          <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:4px">
            Competition: ${genre.competition_score}/100 &nbsp;|&nbsp;
            ~${genre.avg_weeks_to_write} wks to write &nbsp;|&nbsp;
            Need BSR ≤ #${fmtNum(goal.required_bsr_per_book)} per book
          </div>
          <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px">
            ⏱ Estimated time to first dollar: ~${timeToFirstDollar} weeks (${genre.avg_weeks_to_write} wks writing + 4–8 wks to publish &amp; rank)
          </div>

          <div style="font-size:.82rem;font-weight:700;margin-bottom:6px">Specific Topics to Write:</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px">
            ${genre.topics.map((t, ti) => `
              <div style="background:${ti === 0 ? '#eff6ff' : '#f8fafc'};border-radius:7px;padding:10px 12px;border:1px solid ${ti === 0 ? '#bfdbfe' : 'var(--border)'}">
                <div style="font-weight:700;font-size:.8rem;margin-bottom:3px">${escHtml(t.title)}</div>
                <div style="font-size:.72rem;color:var(--text-muted)">${escHtml(t.notes)}</div>
                <div style="margin-top:5px">${scoreBar(t.demand)}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function pgStat(label, value, icon) {
  return `<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px">
    <div style="font-size:1.2rem;margin-bottom:4px">${icon}</div>
    <div style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">${label}</div>
    <div style="font-size:1rem;font-weight:800">${value}</div>
  </div>`;
}
