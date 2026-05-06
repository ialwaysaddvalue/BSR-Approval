function scoreColor(score) {
  if (score >= 70) return 'var(--green)';
  if (score >= 45) return 'var(--yellow)';
  return 'var(--red)';
}

function competitionColor(score) {
  if (score <= 35) return 'var(--green)';
  if (score <= 65) return 'var(--yellow)';
  return 'var(--red)';
}

function scoreBar(score, colorFn = scoreColor) {
  return `
    <div class="score-bar">
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width:${score}%;background:${colorFn(score)}"></div>
      </div>
      <span class="score-bar-label" style="color:${colorFn(score)}">${score}</span>
    </div>`;
}

function badge(text, type = 'gray') {
  return `<span class="badge badge-${type}">${text}</span>`;
}

function tierBadge(tier) {
  const map = { Green: 'green', Yellow: 'yellow', Red: 'red' };
  const labels = { Green: 'Go', Yellow: 'Caution', Red: 'Avoid' };
  return badge(labels[tier] || tier, map[tier] || 'gray');
}

function trendBadge(trend) {
  if (trend === 'Rising') return badge('↑ Rising', 'green');
  if (trend === 'Declining') return badge('↓ Declining', 'red');
  return badge('→ Stable', 'gray');
}

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function fmtMoney(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showLoading(el, msg = 'Fetching data…') {
  el.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>${msg}</span></div>`;
}

function showEmpty(el, icon, title, desc) {
  el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p></div>`;
}

function showError(el, msg) {
  el.innerHTML = `<div class="alert alert-warning" style="margin:0">${msg}</div>`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
