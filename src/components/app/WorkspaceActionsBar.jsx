import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../Modal';

function WorkspaceActionsBar({
  workspaces,
  activeWorkspaceId,
  activeWorkspaceRole = 'viewer',
  canManageWorkspaceShares = false,
  onWorkspaceChange,
  onCreateWorkspace,
  onShareWorkspace,
  onRevokeShare,
  hasRevokableShare,
  onShowToast,
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [shareScope, setShareScope] = useState(() => localStorage.getItem('vault_share_scope') || 'read');

  useEffect(() => {
    localStorage.setItem('vault_share_scope', shareScope);
  }, [shareScope]);

  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    return null;
  }

  const roleLabel = String(activeWorkspaceRole || 'viewer').toLowerCase();
  const capabilityText = canManageWorkspaceShares
    ? 'You can create and revoke share links for this workspace.'
    : 'Only workspace admins can create or revoke share links.';

  const handleCreateWorkspace = async () => {
    const trimmedName = workspaceName.trim();
    if (trimmedName.length < 2) {
      onShowToast?.('Workspace name must be at least 2 characters');
      return;
    }

    await onCreateWorkspace(trimmedName);
    setWorkspaceName('');
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-2 mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center flex-wrap gap-2 text-sm">
          <label htmlFor="workspaceSelect" className="text-gray-700 dark:text-gray-300 font-medium">
            Workspace:
          </label>
          <select
            id="workspaceSelect"
            className="pv-input pv-input-pill w-52 text-sm"
            value={activeWorkspaceId || ''}
            onChange={(event) => {
              const newId = Number.parseInt(event.target.value, 10);
              if (!Number.isNaN(newId)) {
                onWorkspaceChange(newId);
              }
            }}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>

          <label htmlFor="shareScope" className="text-gray-700 dark:text-gray-300 font-medium sm:ml-2">
            Share mode:
          </label>
          <select
            id="shareScope"
            value={shareScope}
            onChange={(event) => setShareScope(event.target.value)}
            disabled={!canManageWorkspaceShares}
            className="pv-input pv-input-pill w-44 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="read">Read</option>
            <option value="comment">Comment</option>
            <option value="clone">Clone</option>
          </select>

          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              roleLabel === 'admin'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                : roleLabel === 'editor'
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700/70 dark:text-gray-200'
            }`}
          >
            Role: {roleLabel}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
          <button
            type="button"
            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-all"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + New workspace
          </button>
          <button
            type="button"
            className="w-full sm:w-auto px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => onShareWorkspace(shareScope)}
            disabled={!canManageWorkspaceShares}
          >
            Share ({shareScope})
          </button>
          {hasRevokableShare && (
            <button
              type="button"
              className="w-full sm:w-auto px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onRevokeShare}
              disabled={!canManageWorkspaceShares}
            >
              Revoke share
            </button>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mt-1 flex flex-wrap items-center gap-4">
        <Link to="/marketplace" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Marketplace
        </Link>
        <p className="text-xs pv-subtle">
          Read: view only, Comment: view + notes, Clone: view + notes + import into your workspace.
        </p>
        <p className="text-xs pv-subtle">{capabilityText}</p>
      </div>

      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setWorkspaceName('');
          }}
          ariaLabel="Create new workspace"
        >
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Workspace</h3>
            <input
              type="text"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Workspace name"
              className="pv-input text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setWorkspaceName('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                onClick={handleCreateWorkspace}
              >
                Create
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default WorkspaceActionsBar;
