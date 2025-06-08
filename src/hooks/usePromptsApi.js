import { useState, useEffect, useCallback } from 'react';
import { useApiErrorHandler } from './useApiErrorHandler';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';

export function usePromptsApi(onShowToast) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useApiErrorHandler(onShowToast);

  const parsePrompts = (data) =>
    data.map((p) => ({
      ...p,
      favorite: p.favorite === 1 || p.favorite === '1' ? 1 : 0,
      tags:
        typeof p.tags === 'string'
          ? p.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
          : [],
    }));

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/prompts_get.php`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setPrompts(parsePrompts(data));
      } else {
        console.error('Expected array for prompts, got:', data);
        setPrompts([]);
        handleError(new Error('Invalid API response'), 'Failed to fetch prompts');
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
      setError(err);
      setPrompts([]);
      handleError(err, 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createPrompt = async (title, content, category, tags = []) => {
    try {
      const response = await fetch(`${BASE_URL}/prompts_create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, tags }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPrompts();
      } else {
        handleError(new Error('API returned failure'), 'Failed to create prompt');
      }
    } catch (err) {
      console.error('Failed to create prompt:', err);
      setError(err);
      handleError(err, 'Failed to create prompt');
    }
  };

  const updatePrompt = async (id, title, content, category, tags = []) => {
    try {
      const response = await fetch(`${BASE_URL}/prompts_update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, content, category, tags }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPrompts();
      } else {
        handleError(new Error('API returned failure'), 'Failed to update prompt');
      }
    } catch (err) {
      console.error('Failed to update prompt:', err);
      setError(err);
      handleError(err, 'Failed to update prompt');
    }
  };

  const updatePromptFavorite = async (id, favorite) => {
    try {
      const response = await fetch(`${BASE_URL}/prompts_update_favorite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, favorite }),
      });
      const data = await response.json();
      if (data.success) {
        // 👉 update state locally for instant feedback:
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, favorite } : p
          )
        );
      } else {
        handleError(new Error('API returned failure'), 'Failed to update favorite');
      }
    } catch (err) {
      console.error('Failed to update prompt favorite:', err);
      setError(err);
      handleError(err, 'Failed to update favorite');
    }
  };

  const deletePrompt = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/prompts_delete.php?id=${id}`);
      const data = await response.json();
      if (data.success) {
        // 👉 update state locally for instant feedback:
        setPrompts((prev) => prev.filter((p) => p.id !== id));
      } else {
        handleError(new Error('API returned failure'), 'Failed to delete prompt');
      }
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      setError(err);
      handleError(err, 'Failed to delete prompt');
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    updatePromptFavorite,
    deletePrompt,
  };
}
