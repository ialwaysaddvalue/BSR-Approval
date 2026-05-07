// ── Revenue Projector ─────────────────────────────────────────────────────────
// Loaded lazily — initRevenue() is called by navigate() on first visit.

let revenueChart = null;

function initRevenue() {
  renderRevenueProjector();
}

function updateRevenueChart() {
  // Re-render chart in case canvas dimensions were stale (panel was hidden)
  const numBooks   = parseInt(document.getElementById('rev-books')?.value  || 5);
  const avgBsr     = parseInt(document.getElementById('rev-bsr')?.value    || 50000);
  const price      = parseFloat(document.getElementById('rev-price')?.value  || 9.99);
  const royaltyPct = parseFloat(document.getElementById('rev-royalty')?.value || 70) / 100;
  setTimeout(() => drawRevenueChart(numBooks, avgBsr, price, royaltyPct), 50);
}

function calcMonthlyRevenue(numBooks, avgBsr, price, royaltyPct) {
  // BSR formula: monthly_sales = a * bsr^(-b)
  const a = 7440, b = 0.699;
  const salesPerBook = Math.max(0, a * Math.pow(Math.max(1, avgBsr), -b));
  return salesPerBook * numBooks * price * royaltyPct;
}

function renderRevenueProjector() {
  const el = document.getElementById('revenue-content');
  if (!el) return;

  el.innerHTML = `
    <div class="grid grid-2 mb-4" style="gap:24px">
      <!-- ── Sliders ── -->
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">Portfolio Settings</div><div class="card-subtitle">Adjust sliders to model your portfolio</div></div>
        </div>

        <div class="form-group">
          <label class="form-label">Number of Books</label>
          <div class="revenue-slider-row">
            <input type="range" id="rev-books" class="range-slider" min="1" max="50" value="5" oninput="updateRevenueDisplay()" />
            <div class="revenue-slider-value"><span id="rev-books-val">5</span> books</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Average BSR per Book</label>
          <div class="revenue-slider-row">
            <input type="range" id="rev-bsr" class="range-slider" min="1000" max="500000" step="1000" value="50000" oninput="updateRevenueDisplay()" />
            <div class="revenue-slider-value">#<span id="rev-bsr-val">50,000</span></div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Average Price per Book ($)</label>
          <div class="revenue-slider-row">
            <input type="range" id="rev-price" class="range-slider" min="0.99" max="19.99" step="0.01" value="9.99" oninput="updateRevenueDisplay()" />
            <div class="revenue-slider-value">$<span id="rev-price-val">9.99</span></div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Royalty Rate</label>
          <div style="display:flex;gap:10px">
            <label style="display:flex;align-items:center;gap:6px;font-size:.85rem;cursor:pointer">
              <input type="radio" name="rev-royalty" id="rev-royalty" value="70" checked onchange="updateRevenueDisplay()" /> 70% (KDP standard)
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:.85rem;cursor:pointer">
              <input type="radio" name="rev-royalty" value="35" onchange="updateRevenueDisplay()" /> 35%
            </label>
          </div>
        </div>
      </div>

      <!-- ── Live Output ── -->
      <div class="card">
        <div class="card-header"><div class="card-title">Projected Revenue</div></div>
        <div id="rev-summary">
          <div class="grid grid-2 mb-4">
            <div style="text-align:center;padding:20px;background:#eff6ff;border-radius:10px">
              <div class="text-xs text-muted mb-1">Monthly Revenue</div>
              <div id="rev-monthly" style="font-size:2.2rem;font-weight:900;color:var(--blue)">$0</div>
              <div class="text-xs text-muted">per month</div>
            </div>
            <div style="text-align:center;padding:20px;background:#f0fdf4;border-radius:10px">
              <div class="text-xs text-muted mb-1">Annual Revenue</div>
              <div id="rev-annual" style="font-size:2.2rem;font-weight:900;color:var(--green)">$0</div>
              <div class="text-xs text-muted">per year</div>
            </div>
          </div>
          <div style="padding:12px;background:#f8fafc;border-radius:8px;font-size:.82rem">
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
              <span class="text-muted">Sales per book/month</span>
              <span class="font-bold" id="rev-sales-per-book">—</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
              <span class="text-muted">Total sales/month</span>
              <span class="font-bold" id="rev-total-sales">—</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
              <span class="text-muted">Revenue per book/month</span>
              <span class="font-bold" id="rev-per-book">—</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0">
              <span class="text-muted">Royalty per sale</span>
              <span class="font-bold" id="rev-royalty-per-sale">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Chart ── -->
    <div class="card mb-4">
      <div class="card-header">
        <div><div class="card-title">Revenue by Portfolio Size</div><div class="card-subtitle">How monthly earnings scale as you publish more books</div></div>
      </div>
      <div class="chart-container" style="height:280px"><canvas id="revenue-chart"></canvas></div>
    </div>

    <!-- ── Breakdown table ── -->
    <div class="card">
      <div class="card-header"><div class="card-title">Portfolio Breakdown Table</div><div class="card-subtitle">Revenue at key portfolio milestones with your current settings</div></div>
      <div class="table-wrap">
        <table class="revenue-breakdown-table">
          <thead><tr>
            <th>Books</th>
            <th>Sales/Book/Mo</th>
            <th>Total Sales/Mo</th>
            <th>Royalty/Sale</th>
            <th>Monthly Revenue</th>
            <th>Annual Revenue</th>
            <th>Daily Revenue</th>
          </tr></thead>
          <tbody id="rev-table-body"></tbody>
        </table>
      </div>
    </div>`;

  // Initial render
  updateRevenueDisplay();
}

function updateRevenueDisplay() {
  const numBooks   = parseInt(document.getElementById('rev-books')?.value  || 5);
  const avgBsr     = parseInt(document.getElementById('rev-bsr')?.value    || 50000);
  const price      = parseFloat(document.getElementById('rev-price')?.value  || 9.99);
  const royaltyPct = parseFloat(document.querySelector('input[name="rev-royalty"]:checked')?.value || 70) / 100;

  // Update slider labels
  const booksVal = document.getElementById('rev-books-val');
  const bsrVal   = document.getElementById('rev-bsr-val');
  const priceVal = document.getElementById('rev-price-val');
  if (booksVal) booksVal.textContent = numBooks;
  if (bsrVal)   bsrVal.textContent   = parseInt(avgBsr).toLocaleString();
  if (priceVal) priceVal.textContent  = parseFloat(price).toFixed(2);

  // Compute values
  const a = 7440, b = 0.699;
  const salesPerBook = Math.max(0, a * Math.pow(Math.max(1, avgBsr), -b));
  const royaltyPerSale = price * royaltyPct;
  const totalSales     = salesPerBook * numBooks;
  const monthlyRev     = totalSales * royaltyPerSale;
  const annualRev      = monthlyRev * 12;

  // Update summary cards
  const monthly = document.getElementById('rev-monthly');
  const annual  = document.getElementById('rev-annual');
  if (monthly) monthly.textContent = fmtMoney(monthlyRev);
  if (annual)  annual.textContent  = fmtMoney(annualRev);

  const spb = document.getElementById('rev-sales-per-book');
  const tts = document.getElementById('rev-total-sales');
  const rpb = document.getElementById('rev-per-book');
  const rps = document.getElementById('rev-royalty-per-sale');
  if (spb) spb.textContent = Math.round(salesPerBook) + ' copies';
  if (tts) tts.textContent = Math.round(totalSales) + ' copies';
  if (rpb) rpb.textContent = fmtMoney(salesPerBook * royaltyPerSale);
  if (rps) rps.textContent = fmtMoney(royaltyPerSale);

  // Update breakdown table
  updateRevenueTable(avgBsr, price, royaltyPct);

  // Update chart
  setTimeout(() => drawRevenueChart(numBooks, avgBsr, price, royaltyPct), 20);
}

function updateRevenueTable(avgBsr, price, royaltyPct) {
  const tbody = document.getElementById('rev-table-body');
  if (!tbody) return;
  const milestones = [1, 2, 3, 5, 10, 20];
  const a = 7440, b = 0.699;
  const salesPerBook = Math.max(0, a * Math.pow(Math.max(1, avgBsr), -b));
  const royaltyPerSale = price * royaltyPct;

  tbody.innerHTML = milestones.map(n => {
    const totalSales = salesPerBook * n;
    const monthly    = totalSales * royaltyPerSale;
    const annual     = monthly * 12;
    const daily      = monthly / 30;
    const highlight  = n === parseInt(document.getElementById('rev-books')?.value || 5);
    return `<tr${highlight ? ' style="background:#eff6ff;font-weight:700"' : ''}>
      <td class="font-bold">${n}</td>
      <td>${Math.round(salesPerBook)}</td>
      <td>${Math.round(totalSales)}</td>
      <td>${fmtMoney(royaltyPerSale)}</td>
      <td class="font-bold" style="color:var(--blue)">${fmtMoney(monthly)}</td>
      <td class="font-bold" style="color:var(--green)">${fmtMoney(annual)}</td>
      <td>${fmtMoney(daily)}</td>
    </tr>`;
  }).join('');
}

function drawRevenueChart(numBooks, avgBsr, price, royaltyPct) {
  const ctx = document.getElementById('revenue-chart');
  if (!ctx) return;
  if (revenueChart) { revenueChart.destroy(); revenueChart = null; }

  const a = 7440, b = 0.699;
  const salesPerBook   = Math.max(0, a * Math.pow(Math.max(1, avgBsr), -b));
  const royaltyPerSale = price * royaltyPct;

  const labels = Array.from({ length: 20 }, (_, i) => i + 1);
  const data   = labels.map(n => Math.round(n * salesPerBook * royaltyPerSale * 100) / 100);

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.map(n => n + (n === 1 ? ' book' : ' books')),
      datasets: [{
        label: 'Monthly Revenue',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: labels.map(n => n === numBooks ? 7 : 3),
        pointBackgroundColor: labels.map(n => n === numBooks ? '#f59e0b' : '#3b82f6'),
        pointBorderColor: labels.map(n => n === numBooks ? '#d97706' : '#3b82f6'),
        pointBorderWidth: labels.map(n => n === numBooks ? 2 : 0),
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `Monthly Revenue: ${fmtMoney(ctx.parsed.y)}`,
            afterLabel: ctx => {
              const n = ctx.dataIndex + 1;
              if (n === numBooks) return '← Your current setting';
              return '';
            },
          },
        },
      },
      scales: {
        y: {
          title: { display: true, text: 'Monthly Revenue ($)' },
          ticks: { callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0) + 'K' : v) },
        },
        x: { title: { display: true, text: 'Number of Books in Portfolio' } },
      },
    },
  });
}
