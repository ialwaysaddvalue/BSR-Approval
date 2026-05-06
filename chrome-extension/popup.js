// ── Config ────────────────────────────────────────────────────────────────────
const LOCAL_API = 'http://localhost:8000/api';

// ── BSR Math (standalone, no server needed) ───────────────────────────────────
const BSR_PARAMS = { kindle: { a: 7440, b: 0.699 }, print: { a: 3700, b: 0.690 } };

function bsrToMonthly(bsr, cat) {
  const { a, b } = BSR_PARAMS[cat] || BSR_PARAMS.kindle;
  return Math.round(a * Math.pow(bsr, -b));
}

function scoreColor(s) {
  return s >= 70 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444';
}
function compColor(s) {
  return s <= 35 ? '#10b981' : s <= 65 ? '#f59e0b' : '#ef4444';
}
function fmtNum(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return String(n);
}
function fmtMoney(n) {
  return '$' + (+n).toFixed(2);
}
function scoreBar(label, score, colorFn = scoreColor) {
  const c = colorFn(score);
  return `<div class="score-bar">
    <span class="score-bar-label">${label}</span>
    <div class="score-bar-track"><div class="score-bar-fill" style="width:${score}%;background:${c}"></div></div>
    <span class="score-bar-num" style="color:${c}">${score}</span>
  </div>`;
}
function badge(text, type='gray') {
  return `<span class="badge badge-${type}">${text}</span>`;
}
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function tryLocalApi(path, params = {}) {
  const url = new URL(LOCAL_API + path);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const r = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error('API error');
  return r.json();
}

async function amazonAutocomplete(q) {
  const url = new URL('https://completion.amazon.com/api/2017/suggestions');
  Object.entries({
    mid: 'ATVPDKIKX0DER', alias: 'stripbooks',
    prefix: q, limit: '10',
    'suggestion-type': 'WIDGET', 'page-type': 'Search',
    lop: 'en_US', 'site-variant': 'desktop',
  }).forEach(([k,v]) => url.searchParams.set(k,v));
  const r = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error();
  const d = await r.json();
  return (d.suggestions || []).map(s => s.value);
}

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Open full app ─────────────────────────────────────────────────────────────
document.getElementById('open-full-app').addEventListener('click', e => {
  e.preventDefault();
  chrome.tabs.create({ url: 'http://localhost:8000' });
});

// ── Auto-detect Amazon page ───────────────────────────────────────────────────
chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
  const tab = tabs[0];
  if (!tab || !tab.url) return;
  const url = tab.url;
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (asinMatch) {
    const asin = asinMatch[1];
    document.getElementById('book-asin-input').value = asin;
    document.getElementById('page-banner').textContent = `📖 Amazon book detected — ASIN: ${asin}`;
    document.getElementById('page-banner').classList.remove('hidden');
    // Auto-switch to book tab
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="book"]').classList.add('active');
    document.getElementById('tab-book').classList.add('active');

    // Try to get live BSR from content script
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const bsrEl = document.querySelector('#detailBulletsWrapper_feature_div, #productDetails_detailBullets_sections1, #SalesRank, .zg-badge-text');
          const text = bsrEl ? bsrEl.innerText : '';
          const match = text.match(/[\d,]+/);
          return match ? parseInt(match[0].replace(/,/g,''), 10) : null;
        },
      });
      if (result) {
        document.getElementById('bsr-input').value = result;
        // Also pre-fill book tab result with live BSR
        const monthly = bsrToMonthly(result, 'kindle');
        document.getElementById('book-result').innerHTML = `<div class="alert-info">Live BSR detected: #${fmtNum(result)} → est. <strong>${monthly} sales/month</strong></div>`;
      }
    } catch (_) {}
  }
});

// ── BSR Calculator ────────────────────────────────────────────────────────────
document.getElementById('bsr-calc-btn').addEventListener('click', () => {
  const bsr    = parseInt(document.getElementById('bsr-input').value, 10);
  const cat    = document.getElementById('bsr-cat').value;
  const price  = parseFloat(document.getElementById('bsr-price').value);
  const royalty = parseFloat(document.getElementById('bsr-royalty').value);
  if (!bsr || bsr < 1) return;

  const monthly = bsrToMonthly(bsr, cat);
  const daily   = (monthly / 30).toFixed(1);
  const rev     = (monthly * price * royalty).toFixed(2);

  let comp = 60, opp = 60;
  if (bsr <= 1000)       { comp = 95; opp = 25; }
  else if (bsr <= 5000)  { comp = 85; opp = 35; }
  else if (bsr <= 15000) { comp = 65; opp = 60; }
  else if (bsr <= 50000) { comp = 45; opp = 75; }
  else                   { comp = 25; opp = 80; }

  document.getElementById('bsr-result').innerHTML = `
    <div class="result-card">
      <div class="result-grid">
        <div class="result-stat"><div class="val">${monthly}</div><div class="lbl">Monthly Sales</div></div>
        <div class="result-stat"><div class="val">${daily}</div><div class="lbl">Daily Sales</div></div>
        <div class="result-stat"><div class="val">${fmtMoney(rev)}</div><div class="lbl">Monthly Revenue</div></div>
        <div class="result-stat"><div class="val">${fmtMoney(monthly * price * royalty * 12)}</div><div class="lbl">Annual Revenue</div></div>
      </div>
      <div style="margin-top:8px">
        ${scoreBar('Competition', comp, compColor)}
        ${scoreBar('Opportunity', opp)}
      </div>
    </div>`;
});

// ── Keywords ─────────────────────────────────────────────────────────────────
document.getElementById('kw-btn').addEventListener('click', async () => {
  const q = document.getElementById('kw-input').value.trim();
  if (!q) return;
  const out = document.getElementById('kw-result');
  out.innerHTML = '<div class="loading">Searching Amazon…</div>';

  try {
    // Try local API first, fall back to direct Amazon autocomplete
    let keywords;
    try {
      const data = await tryLocalApi('/keywords/suggest', { q, limit: 10 });
      keywords = data.keywords;
    } catch {
      const suggestions = await amazonAutocomplete(q);
      keywords = suggestions.map((kw, i) => ({
        keyword: kw,
        estimated_monthly_searches: Math.max(100, 35000 - i*3000),
        competition_score: Math.max(10, 75 - i*5),
      }));
    }

    if (!keywords || keywords.length === 0) {
      out.innerHTML = '<div class="err">No keywords found. Try a different term.</div>';
      return;
    }
    out.innerHTML = `<div class="result-card">
      ${keywords.slice(0,8).map(k => `
        <div class="kw-item">
          <span class="kw-word">${esc(k.keyword)}</span>
          <span class="kw-vol">${fmtNum(k.estimated_monthly_searches)}/mo | Comp: ${k.competition_score}</span>
        </div>`).join('')}
    </div>`;
  } catch (err) {
    out.innerHTML = `<div class="err">Error: ${err.message}</div>`;
  }
});
document.getElementById('kw-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('kw-btn').click();
});

// ── Profit Goal ───────────────────────────────────────────────────────────────
document.getElementById('pg-btn').addEventListener('click', async () => {
  const target  = parseFloat(document.getElementById('pg-target').value);
  const books   = parseInt(document.getElementById('pg-books').value, 10) || 1;
  const price   = parseFloat(document.getElementById('pg-price').value);
  const royalty = parseFloat(document.getElementById('pg-royalty').value);
  if (!target) return;

  const out = document.getElementById('pg-result');
  out.innerHTML = '<div class="loading">Calculating…</div>';

  try {
    let data;
    try {
      data = await tryLocalApi('/profit-goal', { monthly_target: target, price, royalty, books });
    } catch {
      // Offline fallback — basic math
      const royaltyPer = price * royalty;
      const copiesNeeded = Math.ceil(target / royaltyPer / books);
      out.innerHTML = `<div class="result-card">
        <div style="font-weight:800;margin-bottom:6px">Offline estimate</div>
        <div class="result-grid">
          <div class="result-stat"><div class="val">${copiesNeeded}</div><div class="lbl">Copies/book/mo</div></div>
          <div class="result-stat"><div class="val">${fmtMoney(royaltyPer)}</div><div class="lbl">Royalty/sale</div></div>
        </div>
        <div style="margin-top:8px;font-size:11px;color:#64748b">Open the full app for detailed genre recommendations.</div>
      </div>`;
      return;
    }

    const g = data.goal;
    out.innerHTML = `
      <div class="result-card">
        <div class="result-grid">
          <div class="result-stat"><div class="val">${g.copies_per_book_per_month}</div><div class="lbl">Copies/book/mo</div></div>
          <div class="result-stat"><div class="val">#${fmtNum(g.required_bsr_per_book)}</div><div class="lbl">BSR Needed</div></div>
        </div>
        ${scoreBar('Achievability', g.achievability_score)}
        <div style="font-size:10px;color:#64748b;margin:6px 0 8px">${esc(g.summary)}</div>
        <div style="font-weight:800;font-size:11px;margin-bottom:6px">Best Genres:</div>
        ${data.top_genres.slice(0,4).map((genre, i) => `
          <div class="genre-item">
            <div class="genre-name">${i+1}. ${esc(genre.genre)} ${badge(genre.fit_score + '/100', genre.fit_score >= 70 ? 'green' : 'amber')}</div>
            <div class="genre-topic">→ ${esc(genre.topics[0].title)}</div>
            ${scoreBar('Fit', genre.fit_score)}
          </div>`).join('')}
        <div style="font-size:10px;color:#64748b;margin-top:6px">Open full app for all topics &amp; details.</div>
      </div>`;
  } catch (err) {
    out.innerHTML = `<div class="err">Error: ${err.message}</div>`;
  }
});

// ── Book Analyzer ─────────────────────────────────────────────────────────────
document.getElementById('book-btn').addEventListener('click', async () => {
  const asin = document.getElementById('book-asin-input').value.trim().toUpperCase();
  if (!asin || asin.length !== 10) {
    document.getElementById('book-result').innerHTML = '<div class="err">Enter a valid 10-character ASIN.</div>';
    return;
  }
  const out = document.getElementById('book-result');
  out.innerHTML = '<div class="loading">Analyzing…</div>';

  try {
    const d = await tryLocalApi('/book/analyze', { asin });
    out.innerHTML = `<div class="result-card">
      <div class="result-grid">
        <div class="result-stat"><div class="val">#${fmtNum(d.estimated_bsr)}</div><div class="lbl">Est. BSR</div></div>
        <div class="result-stat"><div class="val">${d.estimated_monthly_sales}</div><div class="lbl">Sales/mo</div></div>
        <div class="result-stat"><div class="val">${fmtMoney(d.estimated_monthly_revenue)}</div><div class="lbl">Revenue/mo</div></div>
        <div class="result-stat"><div class="val">${d.review_count}</div><div class="lbl">Reviews</div></div>
      </div>
      <div style="margin-top:8px">
        ${scoreBar('Competition', d.competition_score, compColor)}
        ${scoreBar('Opportunity', d.opportunity_score)}
      </div>
    </div>`;
  } catch {
    out.innerHTML = '<div class="err">Could not connect to local server. Start BookLaunch Pro first.</div>';
  }
});
document.getElementById('book-asin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('book-btn').click();
});
