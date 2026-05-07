// ── KDP Quick Reference ───────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  { id: 'cl-01', text: 'Research your niche — check BSR & competition levels' },
  { id: 'cl-02', text: 'Validate keyword demand using the Keyword Research tool' },
  { id: 'cl-03', text: 'Write/create your book manuscript' },
  { id: 'cl-04', text: 'Design your cover (Canva, Midjourney, or hire a designer)' },
  { id: 'cl-05', text: 'Format your manuscript (Vellum, Atticus, or Microsoft Word)' },
  { id: 'cl-06', text: 'Upload to KDP at kdp.amazon.com' },
  { id: 'cl-07', text: 'Set your 2 Amazon categories and 7 backend keywords' },
  { id: 'cl-08', text: 'Enroll in KDP Select for Kindle Unlimited (if fiction/low-content)' },
  { id: 'cl-09', text: 'Set up your Author Central page (author bio, photo, series info)' },
  { id: 'cl-10', text: 'Plan your launch strategy — ARC readers, launch team, email list' },
  { id: 'cl-11', text: 'Run a KDP price promotion in the first week (free or $0.99 deal)' },
  { id: 'cl-12', text: 'Set up your first Amazon Ads campaign (Sponsored Products)' },
  { id: 'cl-13', text: 'Request reviews from ARC readers and launch team members' },
  { id: 'cl-14', text: 'Monitor BSR daily for the first 30 days' },
  { id: 'cl-15', text: 'Evaluate performance at 30, 60, and 90 days — adjust ads & price' },
];

const KDP_RULES = [
  {
    title: 'KDP Select Exclusivity',
    text: 'When enrolled in KDP Select, your eBook must be exclusive to Amazon — you cannot sell the eBook on any other platform (Smashwords, Draft2Digital, your own site, etc.) for the 90-day enrollment window. Print and audio are not affected.',
  },
  {
    title: 'Category Limits',
    text: 'You can select up to 2 categories for your book during publishing. However, you can request up to 10 total categories by emailing KDP support with your ASIN after publishing. More categories = more discoverability.',
  },
  {
    title: 'Keyword Rules',
    text: 'You get 7 keyword fields of up to 50 characters each. Do NOT repeat your title words — Amazon already indexes the title. Do NOT use competitor names or trademarks. Long-phrase keywords work better than single words.',
  },
  {
    title: '70% Royalty Requirements',
    text: 'To qualify for the 70% royalty rate: price must be $2.99–$9.99 USD, the book must be available in KDP Select\'s 35+ supported territories, and the list price must be at least 20% below any physical version. Outside this range, you earn 35%.',
  },
  {
    title: 'Pricing & Territories',
    text: 'You can set different prices for each Amazon territory (US, UK, DE, JP, etc.). Amazon will sometimes auto-match prices across territories. Price matching can affect your royalty rate — check all territory prices after publishing.',
  },
  {
    title: 'Review Manipulation Policy',
    text: 'Amazon strictly prohibits incentivized reviews (paying for reviews, review swaps, or fake reviews). Violations can result in account suspension. ARC (Advanced Review Copy) readers who receive free books may leave honest reviews without violating policy.',
  },
  {
    title: 'KU Page Read Rates (KENP)',
    text: 'Kindle Unlimited pays per page read (KENP — Kindle Edition Normalized Pages). The rate fluctuates monthly based on the global KU fund divided by total pages read. Historically $0.004–$0.005 per page. A 300-page book read completely = ~$1.20–$1.50 per read.',
  },
  {
    title: 'Cover Image Requirements',
    text: 'eBook covers: minimum 1,000px on the shortest side, ideal 2,560×1,600px (1.6:1 ratio), JPEG or TIFF format. Print covers: must include a spine and back cover; use KDP\'s Cover Calculator for exact dimensions based on page count and paper type.',
  },
  {
    title: 'Free Days & Countdown Deals',
    text: 'KDP Select members get 5 free days per 90-day enrollment window (for free promotions) OR Kindle Countdown Deals (timed price promotions). You cannot run both in the same enrollment period. Free days build rank; Countdown Deals still earn royalties at the discounted price.',
  },
  {
    title: 'ISBN Requirements',
    text: 'Kindle eBooks do not require an ISBN — Amazon assigns an ASIN. Print books (KDP Print) can use a free ISBN assigned by Amazon (which locks you to Amazon distribution) or your own ISBN if you want broader distribution through Expanded Distribution.',
  },
];

function initQuickRef() {
  renderQuickRef();
}

function renderQuickRef() {
  const el = document.getElementById('quickref-content');
  if (!el) return;

  el.innerHTML = `
    <!-- ── Royalty Table ── -->
    <div class="card mb-4">
      <div class="card-header">
        <div><div class="card-title">💰 KDP Royalty Rates at a Glance</div></div>
      </div>
      <div class="grid grid-3 mb-4" style="gap:14px">
        <div style="padding:18px;background:#f0fdf4;border-radius:10px;border:1.5px solid var(--green)">
          <div style="font-size:2rem;font-weight:900;color:var(--green)">70%</div>
          <div style="font-weight:700;margin-bottom:8px">Standard eBook Royalty</div>
          <ul style="font-size:.8rem;color:var(--text-muted);padding-left:16px;margin:0">
            <li>Price: $2.99 – $9.99 USD</li>
            <li>Enrolled in KDP Select preferred</li>
            <li>Available in 35+ territories</li>
            <li>List price ≥ 20% below print price</li>
          </ul>
        </div>
        <div style="padding:18px;background:#fef3c7;border-radius:10px;border:1.5px solid var(--yellow)">
          <div style="font-size:2rem;font-weight:900;color:var(--accent-dark)">35%</div>
          <div style="font-weight:700;margin-bottom:8px">All Other eBooks</div>
          <ul style="font-size:.8rem;color:var(--text-muted);padding-left:16px;margin:0">
            <li>Price below $2.99 or above $9.99</li>
            <li>Books not in supported territories</li>
            <li>Public domain content</li>
          </ul>
        </div>
        <div style="padding:18px;background:#dbeafe;border-radius:10px;border:1.5px solid var(--blue)">
          <div style="font-size:2rem;font-weight:900;color:var(--blue-dark)">60%</div>
          <div style="font-weight:700;margin-bottom:8px">Print (KDP Print)</div>
          <ul style="font-size:.8rem;color:var(--text-muted);padding-left:16px;margin:0">
            <li>60% of list price</li>
            <li>Minus Amazon's printing cost</li>
            <li>Printing cost varies by page count &amp; paper</li>
            <li>Color printing significantly more expensive</li>
          </ul>
        </div>
      </div>
      <div class="alert alert-info" style="margin-bottom:0">
        <strong>Pro tip:</strong> Price your eBook at $9.99 exactly if it's non-fiction — you keep the 70% rate while maximizing revenue per sale. For fiction enrolled in KU, $4.99 is often optimal (good royalty + KU page reads).
      </div>
    </div>

    <!-- ── Pricing Strategy ── -->
    <div class="card mb-4">
      <div class="card-header"><div class="card-title">📊 KDP Pricing Strategy by Genre</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Category</th>
            <th>Recommended eBook Price</th>
            <th>Print Price</th>
            <th>Royalty Rate</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            ${pricingRow('Non-Fiction (Self-Help, Business)', '$9.99 – $14.99', '$14.99 – $19.99', '70% on eBook', 'Higher price = higher perceived value. $9.99 is the sweet spot for 70% royalty.')}
            ${pricingRow('Fiction (Romance, Mystery, Thriller)', '$2.99 – $4.99', '$12.99 – $14.99', '70%', 'Enroll in KU. KU page reads + sales = best income. Series books price lower to drive read-through.')}
            ${pricingRow('Low-Content (Journals, Planners)', '$6.99 – $9.99', '$6.99 – $9.99', '35–70%', 'Print often outsells eBook. Price print at $6.99–$9.99 to remain competitive.')}
            ${pricingRow('Children\'s Books', '$2.99 – $4.99', '$9.99 – $14.99', '70%', 'Print dominates for children\'s. eBook is secondary revenue stream.')}
            ${pricingRow('Cookbooks', '$4.99 – $9.99', '$14.99 – $24.99', '70%', 'Print sells much better — invest in professional interior design and photography.')}
            ${pricingRow('Workbooks & Activity Books', '$7.99 – $12.99', '$8.99 – $12.99', '70%', 'Physical workbooks justify higher print prices due to perceived utility.')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Publishing Checklist ── -->
    <div class="card mb-4">
      <div class="card-header">
        <div>
          <div class="card-title">✅ Publishing Checklist</div>
          <div class="card-subtitle">Track your progress from idea to published book. Saved automatically.</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="resetChecklist()">Reset</button>
      </div>
      <div class="checklist-progress mb-3">
        <span class="text-sm text-muted" id="cl-progress-text">0 / ${CHECKLIST_ITEMS.length} completed</span>
        <div class="checklist-progress-bar">
          <div class="checklist-progress-fill" id="cl-progress-fill" style="width:0%"></div>
        </div>
        <span class="text-sm font-bold" id="cl-progress-pct">0%</span>
      </div>
      <div id="cl-list">
        ${CHECKLIST_ITEMS.map(item => `
          <label class="checklist-item${getClState(item.id) ? ' checked' : ''}" id="cl-item-${item.id}" onclick="toggleChecklistItem('${item.id}', this)">
            <input type="checkbox" ${getClState(item.id) ? 'checked' : ''} onclick="event.stopPropagation();toggleChecklistItem('${item.id}', document.getElementById('cl-item-${item.id}'))" />
            <span>${escHtml(item.text)}</span>
          </label>`).join('')}
      </div>
      <div id="cl-congrats" class="${countChecked() === CHECKLIST_ITEMS.length ? '' : 'hidden'}" style="margin-top:16px;padding:16px;background:#f0fdf4;border-radius:10px;border:1.5px solid var(--green);text-align:center">
        <div style="font-size:1.5rem;margin-bottom:4px">🎉</div>
        <div style="font-weight:700">Checklist complete!</div>
        <div style="font-size:.82rem;color:var(--text-muted)">Your book is ready to launch. Keep monitoring and iterating!</div>
      </div>
    </div>

    <!-- ── KDP Rules ── -->
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Key KDP Rules Every Author Must Know</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px">
        ${KDP_RULES.map(rule => `
          <div style="padding:14px;border:1px solid var(--border);border-radius:8px;background:#f8fafc">
            <div style="font-weight:700;font-size:.85rem;margin-bottom:5px;color:var(--text)">${escHtml(rule.title)}</div>
            <div style="font-size:.78rem;color:var(--text-muted);line-height:1.5">${escHtml(rule.text)}</div>
          </div>`).join('')}
      </div>
    </div>`;

  updateChecklistProgress();
}

// ── Checklist helpers ─────────────────────────────────────────────────────────

function getClState(id) {
  try { return JSON.parse(localStorage.getItem('cl_' + id) || 'false'); }
  catch { return false; }
}

function setClState(id, val) {
  try { localStorage.setItem('cl_' + id, JSON.stringify(val)); } catch {}
}

function countChecked() {
  return CHECKLIST_ITEMS.filter(item => getClState(item.id)).length;
}

function toggleChecklistItem(id, labelEl) {
  const newState = !getClState(id);
  setClState(id, newState);
  const cb = labelEl?.querySelector('input[type="checkbox"]');
  if (cb) cb.checked = newState;
  if (labelEl) labelEl.classList.toggle('checked', newState);
  updateChecklistProgress();
}

function updateChecklistProgress() {
  const total   = CHECKLIST_ITEMS.length;
  const checked = countChecked();
  const pct     = Math.round(checked / total * 100);

  const txt  = document.getElementById('cl-progress-text');
  const fill = document.getElementById('cl-progress-fill');
  const pctEl = document.getElementById('cl-progress-pct');
  const congrats = document.getElementById('cl-congrats');

  if (txt)   txt.textContent   = `${checked} / ${total} completed`;
  if (fill)  fill.style.width  = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (congrats) congrats.classList.toggle('hidden', checked < total);
}

function resetChecklist() {
  CHECKLIST_ITEMS.forEach(item => setClState(item.id, false));
  // Re-render checklist items
  document.querySelectorAll('.checklist-item').forEach((el, i) => {
    el.classList.remove('checked');
    const cb = el.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = false;
  });
  updateChecklistProgress();
}

// ── Helper ────────────────────────────────────────────────────────────────────
function pricingRow(category, ebook, print, royalty, notes) {
  return `<tr>
    <td class="font-bold">${escHtml(category)}</td>
    <td>${escHtml(ebook)}</td>
    <td>${escHtml(print)}</td>
    <td>${badge(royalty, royalty.includes('70') ? 'green' : 'yellow')}</td>
    <td style="font-size:.75rem;color:var(--text-muted)">${escHtml(notes)}</td>
  </tr>`;
}
