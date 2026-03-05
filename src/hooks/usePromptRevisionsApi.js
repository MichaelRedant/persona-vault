import { useState, useCallback } from 'react';
import { apiRequest } from '../api/client';

export function usePromptRevisionsApi(token, workspaceId, onShowToast) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevisions = useCallback(async (promptId) => {
    if (!promptId || !workspaceId || !token) {
      setRevisions([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('prompt_revisions_get.php', {
        method: 'GET',
        token,
        params: {
          prompt_id: promptId,
          workspace_id: workspaceId,
        },
      });

      if (data?.success && Array.isArray(data.revisions)) {
        setRevisions(data.revisions);
        return data.revisions;
      }

      throw new Error(data?.message || 'Invalid API response structure');
    } catch (err) {
      setError(err);
      setRevisions([]);
      onShowToast?.(err?.message || 'Failed to fetch prompt revisions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, onShowToast]);

  return { revisions, loading, error, fetchRevisions };
}
