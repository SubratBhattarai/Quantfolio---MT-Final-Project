const API_BASE = '/api';

function extractErrorMessage(errorData, statusText) {
  if (typeof errorData?.detail === 'string') {
    return errorData.detail;
  }
  if (Array.isArray(errorData?.detail)) {
    return errorData.detail.map(e => `${e.loc?.slice(-1)[0] || 'field'}: ${e.msg}`).join(', ');
  }
  return errorData?.message || `Request failed (${statusText})`;
}

export async function fetchPortfolios() {
  const res = await fetch(`${API_BASE}/portfolios`);
  if (!res.ok) throw new Error(`Failed to fetch portfolios: ${res.statusText}`);
  return res.json();
}

export async function fetchPortfolio(id) {
  const res = await fetch(`${API_BASE}/portfolios/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch portfolio ${id}: ${res.statusText}`);
  return res.json();
}

export async function createPortfolio(data) {
  const res = await fetch(`${API_BASE}/portfolios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData, res.statusText));
  }
  return res.json();
}

export async function updatePortfolio(id, data) {
  const res = await fetch(`${API_BASE}/portfolios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData, res.statusText));
  }
  return res.json();
}

export async function deletePortfolio(id) {
  const res = await fetch(`${API_BASE}/portfolios/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`Failed to delete portfolio: ${res.statusText}`);
  return true;
}

export async function addHolding(portfolioId, data) {
  const res = await fetch(`${API_BASE}/portfolios/${portfolioId}/holdings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData, res.statusText));
  }
  return res.json();
}

export async function updateHolding(holdingId, data) {
  const res = await fetch(`${API_BASE}/holdings/${holdingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(errorData, res.statusText));
  }
  return res.json();
}

export async function deleteHolding(holdingId) {
  const res = await fetch(`${API_BASE}/holdings/${holdingId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`Failed to delete holding: ${res.statusText}`);
  return true;
}

export async function lookupQuote(ticker) {
  const res = await fetch(`${API_BASE}/quotes/${encodeURIComponent(ticker)}`);
  if (!res.ok) throw new Error(`Failed to lookup quote: ${res.statusText}`);
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/reset-demo`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
