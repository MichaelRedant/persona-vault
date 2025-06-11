import { useState, useEffect, useCallback } from 'react';
import { useApiErrorHandler } from './useApiErrorHandler';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';

export function useCollectionsApi(token, onShowToast) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useApiErrorHandler(onShowToast);

  // ✅ stable handleError wrapper → fix for useCallback deps
  const stableHandleError = useCallback((err, msg) => {
    handleError?.(err, msg);
  }, [handleError]);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/collections_get.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setCollections(data);
      } else {
        console.error('Expected array for collections, got:', data);
        setCollections([]);
        stableHandleError(new Error('Invalid API response'), 'Failed to fetch collections');
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      setError(err);
      setCollections([]);
      stableHandleError(err, 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  }, [token, stableHandleError]);

  const createCollection = useCallback(async (name) => {
    try {
      const response = await fetch(`${BASE_URL}/collections_create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchCollections();
      } else {
        stableHandleError(new Error('API returned failure'), 'Failed to create collection');
      }
    } catch (err) {
      console.error('Failed to create collection:', err);
      setError(err);
      stableHandleError(err, 'Failed to create collection');
    }
  }, [token, fetchCollections, stableHandleError]);

  const deleteCollection = useCallback(async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/collections_delete.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        await fetchCollections();
      } else {
        stableHandleError(new Error('API returned failure'), 'Failed to delete collection');
      }
    } catch (err) {
      console.error('Failed to delete collection:', err);
      setError(err);
      stableHandleError(err, 'Failed to delete collection');
    }
  }, [token, fetchCollections, stableHandleError]);

  useEffect(() => {
    if (token && typeof token === 'string' && token.length > 100 && token.startsWith('eyJ')) {
      console.log('useCollectionsApi → Valid token → fetching collections');
      fetchCollections();
    } else {
      console.log('useCollectionsApi → No valid token → skipping collections fetch');
    }
  }, [fetchCollections, token]);

  return {
    collections,
    setCollections,
    loading,
    error,
    fetchCollections,
    createCollection,
    deleteCollection,
  };
}
