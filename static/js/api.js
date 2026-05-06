const API_BASE = '';

async function apiFetch(path, params = {}) {
  const url = new URL(API_BASE + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

const API = {
  keywords: {
    suggest:  (q, limit = 20) => apiFetch('/api/keywords/suggest', { q, limit }),
    analyze:  (q)             => apiFetch('/api/keywords/analyze',  { q }),
  },
  bsr: {
    calculate: (bsr, category, price, royalty) =>
      apiFetch('/api/bsr/calculate', { bsr, category, price, royalty }),
  },
  categories: {
    list: ()     => apiFetch('/api/categories'),
    get:  (id)   => apiFetch(`/api/categories/${id}`),
  },
  niche: {
    search: (q, limit = 12) => apiFetch('/api/niche/search', { q, limit }),
  },
  ads: {
    keywords: (q, budget) => apiFetch('/api/ads/keywords', { q, budget }),
  },
  market: {
    overview: () => apiFetch('/api/market/overview'),
  },
  lowcontent: {
    ideas: (topic, limit = 24) => apiFetch('/api/lowcontent/ideas', { topic, limit }),
  },
  book: {
    analyze: (asin) => apiFetch('/api/book/analyze', { asin }),
  },
  profitGoal: (monthly_target, price, royalty, books) =>
    apiFetch('/api/profit-goal', { monthly_target, price, royalty, books }),
};
