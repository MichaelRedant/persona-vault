import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useApiErrorHandler } from './useApiErrorHandler';

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  return [];
}

function parsePersonas(data) {
  return data.map((persona) => {
    const collectionIds = Array.isArray(persona.collection_ids)
      ? persona.collection_ids.map(Number)
      : Array.isArray(persona.collectionIds)
        ? persona.collectionIds.map(Number)
        : [];

    return {
      ...persona,
      favorite: persona.favorite === 1 || persona.favorite === '1' || persona.favorite === true ? 1 : 0,
      tags: normalizeTags(persona.tags),
      collection_ids: collectionIds,
      collectionIds,
    };
  });
}

export function usePersonasApi(token, onShowToast, workspaceId) {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useApiErrorHandler(onShowToast);

  const fetchPersonas = useCallback(async () => {
    if (!token || !workspaceId) {
      setPersonas([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('personas_get.php', {
        method: 'GET',
        token,
        params: { workspace_id: workspaceId },
      });

      if (!Array.isArray(data)) {
        throw new Error('Invalid API response');
      }

      const parsed = parsePersonas(data);
      setPersonas(parsed);
      return parsed;
    } catch (err) {
      setError(err);
      setPersonas([]);
      handleError(err, 'Failed to fetch personas');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, handleError]);

  const createPersona = useCallback(async (name, description, tags = [], collectionIds = []) => {
    try {
      const data = await apiRequest('personas_create.php', {
        method: 'POST',
        token,
        body: {
          name,
          description,
          tags,
          collection_ids: collectionIds,
          workspace_id: workspaceId,
        },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create persona');
      }

      await fetchPersonas();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to create persona');
      return false;
    }
  }, [token, workspaceId, fetchPersonas, handleError]);

  const updatePersona = useCallback(async (id, name, description, tags = [], collectionIds = []) => {
    try {
      await apiRequest('persona_save_revision.php', {
        method: 'POST',
        token,
        body: { id, workspace_id: workspaceId },
      });

      const data = await apiRequest('personas_update.php', {
        method: 'POST',
        token,
        body: {
          id,
          name,
          description,
          tags,
          collectionIds,
          workspace_id: workspaceId,
        },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update persona');
      }

      await fetchPersonas();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to update persona');
      return false;
    }
  }, [token, workspaceId, fetchPersonas, handleError]);

  const updatePersonaFavorite = useCallback(async (id, favorite) => {
    try {
      const data = await apiRequest('personas_update_favorite.php', {
        method: 'POST',
        token,
        body: { id, favorite, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update favorite');
      }

      setPersonas((previous) =>
        previous.map((persona) => (persona.id === id ? { ...persona, favorite } : persona))
      );
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to update favorite');
      return false;
    }
  }, [token, workspaceId, handleError]);

  const removePersonaFromCollection = useCallback(async (personaId, collectionId) => {
    try {
      const data = await apiRequest('persona_remove_from_collection.php', {
        method: 'POST',
        token,
        body: { personaId, collectionId, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to remove from collection');
      }

      await fetchPersonas();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to remove from collection');
      return false;
    }
  }, [token, workspaceId, fetchPersonas, handleError]);

  const deletePersona = useCallback(async (id) => {
    try {
      const data = await apiRequest('personas_delete.php', {
        method: 'DELETE',
        token,
        params: { id, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete persona');
      }

      setPersonas((previous) => previous.filter((persona) => persona.id !== id));
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to delete persona');
      return false;
    }
  }, [token, workspaceId, handleError]);

  useEffect(() => {
    if (token && typeof token === 'string' && token.length > 100 && token.startsWith('eyJ') && workspaceId) {
      fetchPersonas();
    } else {
      setPersonas([]);
    }
  }, [fetchPersonas, token, workspaceId]);

  return {
    personas,
    setPersonas,
    loading,
    error,
    fetchPersonas,
    createPersona,
    updatePersona,
    updatePersonaFavorite,
    deletePersona,
    removePersonaFromCollection,
  };
}
