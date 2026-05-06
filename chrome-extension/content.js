// Injected on Amazon book pages — reads BSR + shows sidebar badge
(function() {
  'use strict';
  if (window.__blpInjected) return;
  window.__blpInjected = true;

  // ── Read page data ──────────────────────────────────────────────────────────
  function getAsin() {
    const m = location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
    return m ? m[1] : null;
  }

  function getBsr() {
    // Try multiple selectors Amazon uses across page layouts
    const selectors = [
      '#detailBulletsWrapper_feature_div',
      '#productDetails_detailBullets_sections1',
      '#centerCol',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const text = el.innerText || '';
      const m = text.match(/Best Sellers Rank[^#]*#([\d,]+)/i);
      if (m) return parseInt(m[1].replace(/,/g, ''), 10);
    }
    return null;
  }

  function getPrice() {
    const el = document.querySelector('#price_inside_buybox, .a-price .a-offscreen, #kindle-price');
    if (!el) return null;
    const m = (el.textContent || '').match(/[\d.]+/);
    return m ? parseFloat(m[0]) : null;
  }

  function getReviews() {
    const el = document.querySelector('#acrCustomerReviewText, [data-hook="total-review-count"]');
    if (!el) return null;
    const m = (el.textContent || '').replace(/,/g,'').match(/[\d]+/);
    return m ? parseInt(m[0], 10) : null;
  }

  // ── BSR → sales formula ─────────────────────────────────────────────────────
  function bsrToMonthly(bsr) {
    return Math.round(7440 * Math.pow(bsr, -0.699));
  }

  function scoreColor(s) {
    return s >= 70 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444';
  }

  // ── Badge injection ─────────────────────────────────────────────────────────
  function inject(asin, bsr, price, reviews) {
    if (document.getElementById('blp-badge')) return;

    const monthly = bsr ? bsrToMonthly(bsr) : null;
    const royaltyMonthly = monthly && price ? (monthly * price * 0.70).toFixed(0) : null;

    let compScore = 60, oppScore = 60;
    if (bsr) {
      if (bsr <= 1000)       { compScore = 95; oppScore = 25; }
      else if (bsr <= 5000)  { compScore = 85; oppScore = 35; }
      else if (bsr <= 15000) { compScore = 65; oppScore = 60; }
      else if (bsr <= 50000) { compScore = 45; oppScore = 75; }
      else                   { compScore = 25; oppScore = 80; }
    }

    const badge = document.createElement('div');
    badge.id = 'blp-badge';
    badge.innerHTML = `
      <div style="background:#0f172a;color:#fff;border-radius:10px;padding:12px 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;min-width:220px;box-shadow:0 4px 20px rgba(0,0,0,.3)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #1e293b">
          <div style="background:#f59e0b;width:24px;height:24px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#0f172a">B</div>
          <div style="font-weight:800;font-size:12px">BookLaunch Pro</div>
        </div>
        ${bsr ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
            ${statCell('BSR', '#'+bsr.toLocaleString())}
            ${statCell('Monthly Sales', monthly ? '~'+monthly : '?')}
            ${monthly && price ? statCell('Est. Revenue/mo', '$'+royaltyMonthly) : ''}
            ${reviews !== null ? statCell('Reviews', reviews.toLocaleString()) : ''}
          </div>
          ${barRow('Competition', compScore, compScore <= 35 ? '#10b981' : compScore <= 65 ? '#f59e0b' : '#ef4444')}
          ${barRow('Opportunity',  oppScore,  oppScore >= 70  ? '#10b981' : oppScore >= 45  ? '#f59e0b' : '#ef4444')}
        ` : `<div style="font-size:11px;color:#94a3b8">BSR not found on this page.<br>Try the popup for manual analysis.</div>`}
        <div style="margin-top:8px;font-size:10px;color:#475569">ASIN: ${asin}</div>
      </div>`;

    Object.assign(badge.style, {
      position: 'fixed', top: '72px', right: '16px', zIndex: '999999',
      cursor: 'move',
    });

    // Drag to reposition
    let dragging = false, ox = 0, oy = 0;
    badge.addEventListener('mousedown', e => {
      dragging = true; ox = e.clientX - badge.offsetLeft; oy = e.clientY - badge.offsetTop;
      badge.style.right = 'auto';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      badge.style.left = (e.clientX - ox) + 'px';
      badge.style.top  = (e.clientY - oy) + 'px';
    });
    document.addEventListener('mouseup', () => dragging = false);

    // Collapse toggle
    const inner = badge.querySelector('[id]') || badge.firstChild;
    let collapsed = false;
    badge.addEventListener('dblclick', () => {
      collapsed = !collapsed;
      badge.querySelector('div').style.display = collapsed ? 'none' : '';
      badge.title = collapsed ? 'Double-click to expand' : '';
    });

    document.body.appendChild(badge);
  }

  function statCell(label, value) {
    return `<div style="background:#1e293b;border-radius:6px;padding:6px 8px;text-align:center">
      <div style="font-size:11px;font-weight:900">${value}</div>
      <div style="font-size:9px;color:#94a3b8;margin-top:1px;text-transform:uppercase;letter-spacing:.03em">${label}</div>
    </div>`;
  }

  function barRow(label, score, color) {
    return `<div style="display:flex;align-items:center;gap:6px;margin:3px 0;font-size:10px">
      <span style="width:65px;color:#94a3b8">${label}</span>
      <div style="flex:1;height:4px;background:#1e293b;border-radius:99px;overflow:hidden">
        <div style="width:${score}%;height:100%;background:${color};border-radius:99px"></div>
      </div>
      <span style="color:${color};font-weight:700;width:20px;text-align:right">${score}</span>
    </div>`;
  }

  // ── Run ─────────────────────────────────────────────────────────────────────
  const asin = getAsin();
  if (!asin) return;  // Not a product page

  // Wait briefly for page to render dynamic content
  const run = () => {
    const bsr     = getBsr();
    const price   = getPrice();
    const reviews = getReviews();
    inject(asin, bsr, price, reviews);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    // Small delay to let JS-rendered content load
    setTimeout(run, 800);
  }
})();
