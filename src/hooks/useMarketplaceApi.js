// src/hooks/useMarketplaceApi.js
const BASE = import.meta.env.VITE_API_BASE_URL;

export function useMarketplaceApi(token, toast) {
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

  const searchListings = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/marketplace/listings_search.php?${qs}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Search failed');
    return json.items || [];
  };

  const createListing = async (payload) => {
    const res = await fetch(`${BASE}/marketplace/listings_create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Create failed');
    return json.id;
  };

  const updateListing = async (payload) => {
    const res = await fetch(`${BASE}/marketplace/listings_update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Update failed');
  };

  const toggleFavorite = async (listingId) => {
    const res = await fetch(`${BASE}/marketplace/favorites_toggle.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ listing_id: listingId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Fav toggle failed');
    return json.favorite;
  };

  const uploadFile = async (file, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE}/marketplace/files_upload.php`);
      xhr.setRequestHeader('Authorization', auth.Authorization || '');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
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
    await fetch(`${BASE}/marketplace/download_track.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ listing_id: listingId, order_id: orderId }),
    });
  };

  return { searchListings, createListing, updateListing, toggleFavorite, uploadFile, trackDownload };
}
