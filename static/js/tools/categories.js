function initCategories() {
  loadCategoryList();
  document.getElementById('cat-back-btn').addEventListener('click', showCategoryList);
}

async function loadCategoryList() {
  const out = document.getElementById('cat-list-area');
  showLoading(out, 'Loading categories…');
  try {
    const data = await API.categories.list();
    renderCategoryList(data.categories);
  } catch (err) {
    showError(out, err.message);
  }
}

function renderCategoryList(categories) {
  const out = document.getElementById('cat-list-area');
  out.innerHTML = `
    <div class="category-grid">
      ${categories.map(c => `
        <div class="category-card" onclick="loadCategoryDetail('${c.id}')">
          <div class="category-card-name">${escHtml(c.name)}</div>
          <div class="mb-2">
            <div class="text-xs text-muted mb-1">Competition</div>
            ${scoreBar(c.competition_score, competitionColor)}
          </div>
          <div class="category-card-meta">
            ${trendBadge(c.trend)}
            ${badge('Revenue: ' + c.revenue_potential, c.revenue_potential === 'Very High' ? 'green' : c.revenue_potential === 'High' ? 'blue' : 'gray')}
            ${badge(c.subcategory_count + ' sub-cats', 'gray')}
          </div>
        </div>`).join('')}
    </div>`;
}

async function loadCategoryDetail(id) {
  document.getElementById('cat-list-view').classList.add('hidden');
  document.getElementById('cat-detail-view').classList.remove('hidden');

  const out = document.getElementById('cat-detail-area');
  showLoading(out, 'Loading category data…');

  try {
    const d = await API.categories.get(id);
    document.getElementById('cat-detail-title').textContent = d.name;
    renderCategoryDetail(d);
  } catch (err) {
    showError(out, err.message);
  }
}

function showCategoryList() {
  document.getElementById('cat-list-view').classList.remove('hidden');
  document.getElementById('cat-detail-view').classList.add('hidden');
}

function renderCategoryDetail(d) {
  const out = document.getElementById('cat-detail-area');
  out.innerHTML = `
    <div class="grid grid-3 mb-4">
      <div class="stat-card">
        <div class="stat-label">Competition Score</div>
        <div class="stat-value">${d.competition_score}</div>
        ${scoreBar(d.competition_score, competitionColor)}
      </div>
      <div class="stat-card">
        <div class="stat-label">Trend</div>
        <div class="stat-value" style="font-size:1rem">${trendBadge(d.trend)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sub-Categories</div>
        <div class="stat-value">${d.subcategories.length}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Sub-Category Opportunities</div>
          <div class="card-subtitle">Sorted by opportunity score — highest first</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Sub-Category</th>
            <th>Demand</th>
            <th>Competition</th>
            <th>Opportunity</th>
            <th>Top-100 BSR</th>
            <th>Monthly Rev Potential</th>
            <th>Trend</th>
            <th></th>
          </tr></thead>
          <tbody>
            ${d.subcategories.map(s => `
              <tr>
                <td class="font-bold">${escHtml(s.name)}</td>
                <td>${scoreBar(s.demand_score)}</td>
                <td>${scoreBar(s.competition_score, competitionColor)}</td>
                <td>${scoreBar(s.opportunity_score)}</td>
                <td>#${fmtNum(s.top100_bsr_threshold)}</td>
                <td>${fmtMoney(s.est_monthly_revenue)}</td>
                <td>${trendBadge(s.trend)}</td>
                <td>${s.recommended ? badge('Recommended', 'green') : ''}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
