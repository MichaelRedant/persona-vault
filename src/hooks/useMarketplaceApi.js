import { useCallback } from 'react';
import { apiRequest, getApiBaseUrl } from '../api/client';

const BASE = getApiBaseUrl();

export function useMarketplaceApi(token) {
  const searchListings = async (params = {}) => {
    const data = await apiRequest('marketplace/listings_search.php', {
      method: 'GET',
      params,
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Search failed');
    }

    return {
      items: Array.isArray(data.items) ? data.items : [],
      meta: data.meta && typeof data.meta === 'object' ? data.meta : {},
    };
  };

  const createListing = async (payload) => {
    const data = await apiRequest('marketplace/listings_create.php', {
      method: 'POST',
      token,
      body: payload,
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Create failed');
    }

    return data.id;
  };

  const updateListing = async (payload) => {
    const data = await apiRequest('marketplace/listings_update.php', {
      method: 'POST',
      token,
      body: payload,
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Update failed');
    }
  };

  const deleteListing = async (listingId) => {
    const data = await apiRequest('marketplace/listings_delete.php', {
      method: 'POST',
      token,
      body: { id: listingId },
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Delete failed');
    }
  };

  const reportListing = async (listingId, reason, details = '') => {
    const data = await apiRequest('marketplace/listings_report.php', {
      method: 'POST',
      token,
      body: { listing_id: listingId, reason, details },
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Report failed');
    }

    return data.report_id;
  };

  const getListingReports = async (status = 'open', limit = 100) => {
    const data = await apiRequest('marketplace/listings_reports_get.php', {
      method: 'GET',
      token,
      params: { status, limit },
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to fetch reports');
    }

    return Array.isArray(data.items) ? data.items : [];
  };

  const getListingEvents = async (listingId, limit = 25) => {
    const data = await apiRequest('marketplace/listings_events_get.php', {
      method: 'GET',
      token,
      params: { listing_id: listingId, limit },
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to fetch listing events');
    }

    return Array.isArray(data.items) ? data.items : [];
  };

  const resolveListingReport = async (reportId, reportStatus, listingStatus = null) => {
    const payload = {
      report_id: reportId,
      report_status: reportStatus,
    };

    if (listingStatus) {
      payload.listing_status = listingStatus;
    }

    const data = await apiRequest('marketplace/listings_reports_resolve.php', {
      method: 'POST',
      token,
      body: payload,
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to resolve report');
    }
  };

  const toggleFavorite = async (listingId) => {
    const data = await apiRequest('marketplace/favorites_toggle.php', {
      method: 'POST',
      token,
      body: { listing_id: listingId },
      retries: 1,
    });

    if (!data?.success) {
      throw new Error(data?.error || 'Fav toggle failed');
    }

    return data.favorite;
  };

  const uploadFile = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE}/marketplace/files_upload.php`);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      };

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (!json.success) {
            reject(new Error(json.error || 'Upload failed'));
            return;
          }
          resolve(json);
        } catch {
          reject(new Error('Upload parse error'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload error'));
      xhr.send(formData);
    });
  };

  const trackDownload = async (listingId, orderId = null) => {
    try {
      await apiRequest('marketplace/download_track.php', {
        method: 'POST',
        token,
        body: { listing_id: listingId, order_id: orderId },
      });
    } catch {
      // Non-blocking analytics endpoint
    }
  };

  const getListableItems = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      return { personas: [], prompts: [] };
    }

    const [personasRaw, promptsRaw] = await Promise.all([
      apiRequest('personas_get.php', {
        method: 'GET',
        token,
        params: { workspace_id: workspaceId },
        retries: 1,
      }),
      apiRequest('prompts_get.php', {
        method: 'GET',
        token,
        params: { workspace_id: workspaceId },
        retries: 1,
      }),
    ]);

    const personas = Array.isArray(personasRaw)
      ? personasRaw.map((persona) => ({
          id: Number(persona.id),
          type: 'persona',
          label: persona.name || `Persona #${persona.id}`,
        }))
      : [];

    const prompts = Array.isArray(promptsRaw)
      ? promptsRaw.map((prompt) => ({
          id: Number(prompt.id),
          type: 'prompt',
          label: prompt.title || `Prompt #${prompt.id}`,
        }))
      : [];

    return { personas, prompts };
  }, [token]);

  return {
    searchListings,
    createListing,
    updateListing,
    deleteListing,
    reportListing,
    getListingReports,
    getListingEvents,
    resolveListingReport,
    toggleFavorite,
    uploadFile,
    trackDownload,
    getListableItems,
  };
}
