import { useState, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';

export function usePromptRevisionsApi(token, workspaceId) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevisions = useCallback(async (promptId) => {
    if (!promptId) {
      console.warn('⚠️ fetchRevisions called without valid promptId');
      setRevisions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/prompt_revisions_get.php?prompt_id=${promptId}&workspace_id=${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.revisions)) {
        setRevisions(data.revisions);
      } else {
        throw new Error(data.message || 'Invalid API response structure');
      }
    } catch (err) {
      console.error('❌ Failed to fetch prompt revisions:', err);
      setError(err);
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  return { revisions, loading, error, fetchRevisions };
}
