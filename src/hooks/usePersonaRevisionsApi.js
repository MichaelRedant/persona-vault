import { useState, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';

export function usePersonaRevisionsApi(token) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRevisions = useCallback(async (personaId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/persona_get_revisions.php?persona_id=${personaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('📥 Fetched persona revisions:', data);

      if (data.success && Array.isArray(data.revisions)) {
        setRevisions(data.revisions);
      } else {
        console.warn('Unexpected response structure for revisions');
        setRevisions([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch persona revisions:', err);
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { revisions, loading, fetchRevisions };
}
