import { useCallback, useState } from 'react';
import { apiRequest } from '../api/client';

export function useAdminApi(token, onToast) {
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiRequest('admin_users_get.php', { token });
      if (!data?.success || !Array.isArray(data.users)) {
        throw new Error(data?.message || 'Failed to fetch users');
      }

      setUsers(data.users);
      return data.users;
    } catch {
      onToast?.('Error fetching users');
      return [];
    }
  }, [token, onToast]);

  const fetchAllWorkspaces = useCallback(async () => {
    try {
      const data = await apiRequest('admin_workspaces_get_all.php', { token });
      if (!data?.success || !Array.isArray(data.workspaces)) {
        throw new Error(data?.message || 'Failed to fetch workspaces');
      }

      setWorkspaces(data.workspaces);
      return data.workspaces;
    } catch {
      onToast?.('Error fetching workspaces');
      return [];
    }
  }, [token, onToast]);

  const createWorkspaceForUser = useCallback(async (ownerId, name) => {
    try {
      const data = await apiRequest('admin_workspace_create.php', {
        method: 'POST',
        token,
        body: { owner_id: ownerId, name },
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to create workspace');
      }

      await fetchAllWorkspaces();
      onToast?.('Workspace created');
      return true;
    } catch {
      onToast?.('Failed to create workspace');
      return false;
    }
  }, [token, fetchAllWorkspaces, onToast]);

  const deleteWorkspace = useCallback(async (workspaceId) => {
    try {
      const data = await apiRequest('admin_workspace_delete.php', {
        method: 'DELETE',
        token,
        params: { id: workspaceId },
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to delete workspace');
      }

      await fetchAllWorkspaces();
      onToast?.('Workspace deleted');
      return true;
    } catch {
      onToast?.('Failed to delete workspace');
      return false;
    }
  }, [token, fetchAllWorkspaces, onToast]);

  const fetchGlobalStats = useCallback(async () => {
    try {
      const data = await apiRequest('admin_stats_global.php', { token });
      if (!data?.success || !data.stats) {
        throw new Error(data?.message || 'Failed to fetch stats');
      }

      setGlobalStats(data.stats);
      return data.stats;
    } catch {
      onToast?.('Error fetching stats');
      return null;
    }
  }, [token, onToast]);

  return {
    users,
    workspaces,
    globalStats,
    fetchUsers,
    fetchAllWorkspaces,
    fetchGlobalStats,
    createWorkspaceForUser,
    deleteWorkspace,
  };
}
