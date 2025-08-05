import { useCallback, useState } from 'react';

export function useAdminApi(token, onToast) {
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/admin_users_get.php`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data.users);
      return data.users;
    } catch (err) {
      onToast?.('Error fetching users');
      console.error(err);
      return [];
    }
  }, [baseUrl, token, onToast]);

  const fetchAllWorkspaces = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/admin_workspaces_get_all.php`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch workspaces');
      setWorkspaces(data.workspaces);
      return data.workspaces;
    } catch (err) {
      onToast?.('Error fetching workspaces');
      console.error(err);
      return [];
    }
  }, [baseUrl, token, onToast]);

  const createWorkspaceForUser = useCallback(async (ownerId, name) => {
    try {
      const res = await fetch(`${baseUrl}/admin_workspace_create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ owner_id: ownerId, name })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create workspace');
      await fetchAllWorkspaces();
      onToast?.('Workspace created');
    } catch (err) {
      onToast?.('Failed to create workspace');
      console.error(err);
    }
  }, [baseUrl, token, fetchAllWorkspaces, onToast]);

  const deleteWorkspace = useCallback(async (workspaceId) => {
    try {
      const res = await fetch(`${baseUrl}/admin_workspace_delete.php?id=${workspaceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete workspace');
      await fetchAllWorkspaces();
      onToast?.('Workspace deleted');
    } catch (err) {
      onToast?.('Failed to delete workspace');
      console.error(err);
    }
  }, [baseUrl, token, fetchAllWorkspaces, onToast]);

  return {
    users,
    workspaces,
    fetchUsers,
    fetchAllWorkspaces,
    createWorkspaceForUser,
    deleteWorkspace
  };
}
