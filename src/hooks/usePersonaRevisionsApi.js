import { useState, useCallback } from 'react';
import { apiRequest } from '../api/client';

export function usePersonaRevisionsApi(token, workspaceId, onShowToast) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevisions = useCallback(async (personaId) => {
    if (!personaId || !workspaceId || !token) {
      setRevisions([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('persona_get_revisions.php', {
        method: 'GET',
        token,
        params: {
          persona_id: personaId,
          workspace_id: workspaceId,
        },
      });

      if (data?.success && Array.isArray(data.revisions)) {
        setRevisions(data.revisions);
        return data.revisions;
      }

      throw new Error(data?.message || 'Failed to load persona revisions');
    } catch (err) {
      setError(err);
      setRevisions([]);
      onShowToast?.(err?.message || 'Failed to fetch persona revisions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, onShowToast]);

  return { revisions, loading, error, fetchRevisions };
}
