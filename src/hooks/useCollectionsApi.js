import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useApiErrorHandler } from './useApiErrorHandler';

export function useCollectionsApi(token, onShowToast, workspaceId) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useApiErrorHandler(onShowToast);

  const fetchCollections = useCallback(async () => {
    if (!token || !workspaceId) {
      setCollections([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('collections_get.php', {
        method: 'GET',
        token,
        params: { workspace_id: workspaceId },
      });

      if (!Array.isArray(data)) {
        throw new Error('Invalid API response');
      }

      setCollections(data);
      return data;
    } catch (err) {
      setError(err);
      setCollections([]);
      handleError(err, 'Failed to fetch collections');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, handleError]);

  const createCollection = useCallback(async (name) => {
    try {
      const data = await apiRequest('collections_create.php', {
        method: 'POST',
        token,
        body: { name, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create collection');
      }

      await fetchCollections();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to create collection');
      return false;
    }
  }, [token, workspaceId, fetchCollections, handleError]);

  const deleteCollection = useCallback(async (id) => {
    try {
      const data = await apiRequest('collections_delete.php', {
        method: 'DELETE',
        token,
        params: { id, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete collection');
      }

      await fetchCollections();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to delete collection');
      return false;
    }
  }, [token, workspaceId, fetchCollections, handleError]);

  const renameCollection = useCallback(async (id, name) => {
    try {
      const data = await apiRequest('collections_update.php', {
        method: 'PUT',
        token,
        body: { id, name, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to rename collection');
      }

      await fetchCollections();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to rename collection');
      return false;
    }
  }, [token, workspaceId, fetchCollections, handleError]);

  useEffect(() => {
    if (token && typeof token === 'string' && token.length > 100 && token.startsWith('eyJ') && workspaceId) {
      fetchCollections();
    } else {
      setCollections([]);
    }
  }, [fetchCollections, token, workspaceId]);

  return {
    collections,
    setCollections,
    loading,
    error,
    fetchCollections,
    createCollection,
    deleteCollection,
    renameCollection,
  };
}
