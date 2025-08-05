import { useEffect, useState } from 'react';
import { FiX, FiTrash, FiPlus } from 'react-icons/fi';
import Button from './Button';
import { useAdminApi } from '../hooks/useAdminApi';

export default function AdminPanelModal({ isOpen, onClose, token, onToast }) {
  const {
    users,
    workspaces,
    globalStats,
    fetchUsers,
    fetchAllWorkspaces,
    fetchGlobalStats,
    createWorkspaceForUser,
    deleteWorkspace
  } = useAdminApi(token, onToast);

  const [workspaceName, setWorkspaceName] = useState('');
  const [ownerId, setOwnerId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchAllWorkspaces();
      fetchGlobalStats();
    }
  }, [isOpen, fetchUsers, fetchAllWorkspaces, fetchGlobalStats]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    await createWorkspaceForUser(ownerId, workspaceName);
    setWorkspaceName('');
    setOwnerId('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-3xl space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <FiX className="text-xl" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>

        {globalStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="text-sm text-gray-500">Total personas</div>
              <div className="text-xl font-semibold">{globalStats.total_personas}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="text-sm text-gray-500">Total prompts</div>
              <div className="text-xl font-semibold">{globalStats.total_prompts}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="text-sm text-gray-500">Avg. prompts per persona</div>
              <div className="text-xl font-semibold">
                {globalStats.average_prompts_per_persona.toFixed(2)}
              </div>
            </div>
            {globalStats.most_active_workspace && (
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="text-sm text-gray-500">Most active workspace</div>
                <div className="text-xl font-semibold">
                  {globalStats.most_active_workspace.name}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-2">User statistics</h3>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Personas</th>
                  <th className="px-2 py-1">Prompts</th>
                  <th className="px-2 py-1">Collections</th>
                  <th className="px-2 py-1">Workspaces</th>
                  <th className="px-2 py-1">Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1">{u.username}</td>
                    <td className="px-2 py-1">{u.persona_count}</td>
                    <td className="px-2 py-1">{u.prompt_count}</td>
                    <td className="px-2 py-1">{u.collection_count}</td>
                    <td className="px-2 py-1">{u.workspace_count}</td>
                    <td className="px-2 py-1">{u.is_admin ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="px-2 py-1 text-gray-500" colSpan="6">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create workspace */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Create workspace</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="px-3 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!workspaceName || !ownerId}
            >
              <FiPlus className="mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Workspaces list */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-2">All workspaces</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {workspaces.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2"
              >
                <div>
                  <div className="font-medium">{w.name}</div>
                  <div className="text-sm text-gray-500">Owner: {w.owner_username}</div>
                </div>
                <button
                  onClick={() => deleteWorkspace(w.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  <FiTrash />
                </button>
              </li>
            ))}
            {workspaces.length === 0 && (
              <li className="text-sm text-gray-500">No workspaces found</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
