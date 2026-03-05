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

function parsePrompts(data) {
  return data.map((prompt) => ({
    ...prompt,
    favorite: prompt.favorite === 1 || prompt.favorite === '1' || prompt.favorite === true ? 1 : 0,
    tags: normalizeTags(prompt.tags),
  }));
}

export function usePromptsApi(token, onShowToast, workspaceId) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useApiErrorHandler(onShowToast);

  const fetchPrompts = useCallback(async () => {
    if (!token || !workspaceId) {
      setPrompts([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('prompts_get.php', {
        method: 'GET',
        token,
        params: { workspace_id: workspaceId },
      });

      if (!Array.isArray(data)) {
        throw new Error('Invalid API response');
      }

      const parsed = parsePrompts(data);
      setPrompts(parsed);
      return parsed;
    } catch (err) {
      setError(err);
      setPrompts([]);
      handleError(err, 'Failed to fetch prompts');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, handleError]);

  const createPrompt = useCallback(async (title, content, category, tags = []) => {
    try {
      const data = await apiRequest('prompts_create.php', {
        method: 'POST',
        token,
        body: { title, content, category, tags, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create prompt');
      }

      await fetchPrompts();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to create prompt');
      return false;
    }
  }, [token, workspaceId, fetchPrompts, handleError]);

  const updatePrompt = useCallback(async (id, title, content, category, tags = []) => {
    try {
      await apiRequest('prompt_save_revision.php', {
        method: 'POST',
        token,
        body: { id, workspace_id: workspaceId },
      });

      const data = await apiRequest('prompts_update.php', {
        method: 'POST',
        token,
        body: { id, title, content, category, tags, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update prompt');
      }

      await fetchPrompts();
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to update prompt');
      return false;
    }
  }, [token, workspaceId, fetchPrompts, handleError]);

  const updatePromptFavorite = useCallback(async (id, favorite) => {
    try {
      const data = await apiRequest('prompts_update_favorite.php', {
        method: 'POST',
        token,
        body: { id, favorite, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update favorite');
      }

      setPrompts((previous) => previous.map((prompt) => (prompt.id === id ? { ...prompt, favorite } : prompt)));
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to update favorite');
      return false;
    }
  }, [token, workspaceId, handleError]);

  const deletePrompt = useCallback(async (id) => {
    try {
      const data = await apiRequest('prompts_delete.php', {
        method: 'DELETE',
        token,
        params: { id, workspace_id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete prompt');
      }

      setPrompts((previous) => previous.filter((prompt) => prompt.id !== id));
      return true;
    } catch (err) {
      setError(err);
      handleError(err, 'Failed to delete prompt');
      return false;
    }
  }, [token, workspaceId, handleError]);

  useEffect(() => {
    if (token && typeof token === 'string' && token.length > 100 && token.startsWith('eyJ') && workspaceId) {
      fetchPrompts();
    } else {
      setPrompts([]);
    }
  }, [fetchPrompts, token, workspaceId]);

  return {
    prompts,
    setPrompts,
    loading,
    error,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    updatePromptFavorite,
    deletePrompt,
  };
}
