import { useState, useCallback } from 'react';

export function useWorkspacesApi(token, onToast) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/workspaces_get.php`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Failed to fetch workspaces');

      setWorkspaces(result.workspaces);
      return result.workspaces;
    } catch (err) {
      setError(err.message);
      onToast?.('Error fetching workspaces');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, onToast]);

  const createWorkspace = useCallback(async (name) => {
    try {
      const response = await fetch(`${baseUrl}/workspaces_create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Workspace creation failed');

      // fetch opnieuw na create
      await fetchWorkspaces();
      onToast?.('Workspace created successfully!');
    } catch (err) {
      onToast?.('Failed to create workspace');
      console.error(err);
    }
  }, [baseUrl, token, fetchWorkspaces, onToast]);

  return {
    workspaces,
    setWorkspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace
  };
}
