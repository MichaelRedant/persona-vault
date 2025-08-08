// src/hooks/useMarketplaceApi.js
const BASE = (import.meta.env.VITE_API_BASE_URL || '/vault/api').replace(/\/$/, '');

// kleine helper: veilige JSON parse (soms serveert de host HTML error pages)
async function safeJson(res) {
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('application/json')) return res.json();
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(text.slice(0, 200)); }
}

// eenvoudige retry bij 429/503
async function fetchWithRetry(url, opts = {}, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (!res.ok) {
        // bij 429/503 een korte backoff en nog eens proberen
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
          continue;
        }
        const body = await safeJson(res).catch(() => ({}));
        const msg = typeof body === 'string' ? body : (body.error || JSON.stringify(body));
        throw new Error(`HTTP ${res.status} – ${msg}`);
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr;
}

export function useMarketplaceApi(token) {
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

  // PUBLIC browse → geen auth / geen Content-Type header nodig (voorkomt preflight)
  const searchListings = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = `${BASE}/marketplace/listings_search.php${qs ? `?${qs}` : ''}`;

    try {
      const res = await fetchWithRetry(url, { method: 'GET' }, 1);
      const json = await safeJson(res);
      if (!json.success) throw new Error(json.error || 'Search failed');
      return json.items || [];
    } catch (err) {
      console.error('Search failed:', err);
      return [];
    }
  };

  const createListing = async (payload) => {
    const res = await fetchWithRetry(`${BASE}/marketplace/listings_create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(payload),
    });
    const json = await safeJson(res);
    if (!json.success) throw new Error(json.error || 'Create failed');
    return json.id;
  };

  const updateListing = async (payload) => {
    const res = await fetchWithRetry(`${BASE}/marketplace/listings_update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(payload),
    });
    const json = await safeJson(res);
    if (!json.success) throw new Error(json.error || 'Update failed');
  };

  const deleteListing = async (listingId) => {
    const res = await fetchWithRetry(`${BASE}/marketplace/listings_delete.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ id: listingId }),
    });
    const json = await safeJson(res);
    if (!json.success) throw new Error(json.error || 'Delete failed');
  };

  const toggleFavorite = async (listingId) => {
    const res = await fetchWithRetry(`${BASE}/marketplace/favorites_toggle.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ listing_id: listingId }),
    });
    const json = await safeJson(res);
    if (!json.success) throw new Error(json.error || 'Fav toggle failed');
    return json.favorite;
  };

  // multipart upload via XHR om progress te tonen
  const uploadFile = async (file, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE}/marketplace/files_upload.php`);
      if (auth.Authorization) xhr.setRequestHeader('Authorization', auth.Authorization);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      };
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (!json.success) return reject(new Error(json.error || 'Upload failed'));
          resolve(json);
        } catch {
          reject(new Error('Upload parse error'));
        }
      };
      xhr.onerror = () => reject(new Error('Upload error'));
      xhr.send(fd);
    });
  };

  const trackDownload = async (listingId, orderId = null) => {
    try {
      const res = await fetchWithRetry(`${BASE}/marketplace/download_track.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ listing_id: listingId, order_id: orderId }),
      });
      await safeJson(res).catch(() => ({}));
    } catch (e) {
      // non-blocking
      console.warn('trackDownload failed:', e.message);
    }
  };

  return {
    searchListings,
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    uploadFile,
    trackDownload,
  };
}
