import { useCallback, useState } from 'react';
import { apiRequest } from '../api/client';

function normalizeWorkspaceRole(role) {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'admin' || normalized === 'editor' || normalized === 'viewer') {
    return normalized;
  }
  return 'viewer';
}

export function useWorkspacesApi(token, onToast) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    if (!token) {
      setWorkspaces([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest('workspaces_get.php', { token });
      if (!result?.success || !Array.isArray(result.workspaces)) {
        throw new Error(result?.message || 'Failed to fetch workspaces');
      }

      const normalized = result.workspaces.map((workspace) => ({
        ...workspace,
        id: Number(workspace.id),
        owner_id: Number(workspace.owner_id),
        role: normalizeWorkspaceRole(workspace.role),
        is_owner: Number(workspace.is_owner) === 1,
      }));

      setWorkspaces(normalized);
      return normalized;
    } catch (err) {
      setError(err);
      onToast?.('Error fetching workspaces');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, onToast]);

  const createWorkspace = useCallback(async (name) => {
    if (!token) {
      onToast?.('Authentication required');
      return false;
    }

    try {
      const result = await apiRequest('workspaces_create.php', {
        method: 'POST',
        token,
        body: { name },
      });

      if (!result?.success) {
        throw new Error(result?.message || 'Workspace creation failed');
      }

      await fetchWorkspaces();
      onToast?.('Workspace created successfully!');
      return true;
    } catch {
      onToast?.('Failed to create workspace');
      return false;
    }
  }, [token, fetchWorkspaces, onToast]);

  return {
    workspaces,
    setWorkspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
  };
}
