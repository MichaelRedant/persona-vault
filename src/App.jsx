/* eslint-disable react-hooks/exhaustive-deps */
import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import AuthLayout from './components/AuthLayout';
import FloatingInstallBanner from './components/FloatingInstallBanner';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ScrollToTopButton from './components/ScrollToTopButton';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import MobileBottomNav from './components/app/MobileBottomNav';
import WorkspaceActionsBar from './components/app/WorkspaceActionsBar';
import { useCollectionsApi } from './hooks/useCollectionsApi';
import { usePersonasApi } from './hooks/usePersonasApi';
import { usePromptsApi } from './hooks/usePromptsApi';
import { useWorkspacesApi } from './hooks/useWorkspacesApi';
import { testTokenValid } from './utils/tokenChecker';
import './index.css';

const AppModals = lazy(() => import('./components/app/AppModals'));
const VaultDashboards = lazy(() => import('./components/app/VaultDashboards'));

function App() {
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [collectionSortOption, setCollectionSortOption] = useState('alphabetical');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [personaSortOption, setPersonaSortOption] = useState('newest');
  const [promptSortOption, setPromptSortOption] = useState('newest');
  const [globalToastMessage, setGlobalToastMessage] = useState('');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');

  const [decodedToken, setDecodedToken] = useState(null);
  const [editingPersona, setEditingPersona] = useState(null);

  const [selectedTab, setSelectedTab] = useState(() => localStorage.getItem('vault_selectedTab') || 'personas');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('vault_setting_compactMode') === 'true');
  const [lastShareToken, setLastShareToken] = useState(() => localStorage.getItem('vault_lastShareToken') || '');
  const [token, setToken] = useState(() => localStorage.getItem('vault_jwt_token') || null);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    const fromStorage = localStorage.getItem('vault_activeWorkspaceId');
    return fromStorage ? Number.parseInt(fromStorage, 10) : null;
  });

  const [activeCollectionId, setActiveCollectionId] = useState(() => {
    const storedId = localStorage.getItem('vault_activeCollectionId');
    return storedId ? Number(storedId) : null;
  });

  const [defaultCollectionIdForNewPersona, setDefaultCollectionIdForNewPersona] = useState(null);
  const [authTab, setAuthTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('register') ? 'register' : 'login';
  });

  const {
    workspaces,
    fetchWorkspaces,
    createWorkspace,
  } = useWorkspacesApi(token, setGlobalToastMessage);

  const {
    personas,
    loading: loadingPersonas,
    error: errorPersonas,
    setPersonas,
    fetchPersonas,
    createPersona,
    updatePersona,
    deletePersona,
    updatePersonaFavorite,
    removePersonaFromCollection,
  } = usePersonasApi(token, setGlobalToastMessage, activeWorkspaceId);

  const {
    prompts,
    loading: loadingPrompts,
    error: errorPrompts,
    setPrompts,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    updatePromptFavorite,
  } = usePromptsApi(token, setGlobalToastMessage, activeWorkspaceId);

  const {
    collections,
    setCollections,
    loading: loadingCollections,
    error: errorCollections,
    createCollection,
    deleteCollection,
    fetchCollections,
    renameCollection,
  } = useCollectionsApi(token, setGlobalToastMessage, activeWorkspaceId);

  useEffect(() => {
    const message = sessionStorage.getItem('vault_logout_message');
    if (message) {
      setGlobalToastMessage(message);
      sessionStorage.removeItem('vault_logout_message');
    }
  }, []);

  useEffect(() => {
    const updateSidebar = () => {
      setIsSidebarOpen(window.innerWidth >= 640);
    };

    updateSidebar();
    window.addEventListener('resize', updateSidebar);
    return () => window.removeEventListener('resize', updateSidebar);
  }, []);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('vault_jwt_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!tokenFromStorage || tokenFromStorage.length < 100 || !tokenFromStorage.startsWith('eyJ')) {
      return;
    }

    const alreadyChecked = sessionStorage.getItem('vault_token_checked');
    if (alreadyChecked) {
      return;
    }

    const checkToken = async () => {
      const isValid = await testTokenValid(baseUrl, tokenFromStorage);
      if (!isValid) {
        sessionStorage.setItem('vault_token_checked', '1');
        localStorage.removeItem('vault_jwt_token');
        sessionStorage.setItem('vault_logout_message', 'Your session has expired, please log in again.');
        window.location.reload();
      } else {
        sessionStorage.setItem('vault_token_checked', '1');
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setCompactMode(localStorage.getItem('vault_setting_compactMode') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    (async () => {
      const fetched = await fetchWorkspaces();
      const storedWorkspaceIdStr = localStorage.getItem('vault_activeWorkspaceId');
      const storedWorkspaceId = storedWorkspaceIdStr ? Number.parseInt(storedWorkspaceIdStr, 10) : null;
      const validStoredId = storedWorkspaceId && fetched.some((workspace) => Number(workspace.id) === storedWorkspaceId);

      if (validStoredId) {
        setActiveWorkspaceId(storedWorkspaceId);
      } else if (fetched.length > 0) {
        const fallbackId = Number(fetched[0].id);
        setActiveWorkspaceId(fallbackId);
        localStorage.setItem('vault_activeWorkspaceId', String(fallbackId));
      }
    })();
  }, [token, fetchWorkspaces]);

  useEffect(() => {
    if (!token) {
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);
      setUsername(decoded.username || decoded.email || 'User');
      setIsAdmin(Boolean(decoded.is_admin));

      if (!activeWorkspaceId && decoded.workspace_id) {
        setActiveWorkspaceId(decoded.workspace_id);
        localStorage.setItem('vault_activeWorkspaceId', String(decoded.workspace_id));
      }

      fetchPersonas();
      fetchPrompts();
      fetchCollections();
    } catch {
      setGlobalToastMessage('Error during token processing.');
    }
  }, [token, fetchPersonas, fetchCollections, fetchPrompts]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('register')) {
      setAuthTab('register');
    }
  }, [location.search]);

  useEffect(() => {
    const displayUsername = username ? `${username}'s Vault` : 'Persona Vault';
    document.title = `${displayUsername} (${personas.length} Personas | ${prompts.length} Prompts)`;
  }, [personas.length, prompts.length, username]);

  useEffect(() => {
    if (selectedTab === 'collectionDetail' && activeCollectionId !== null) {
      fetchPersonas();
    }
  }, [selectedTab, activeCollectionId, fetchPersonas]);

  useEffect(() => {
    localStorage.setItem('vault_selectedTab', selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    if (activeCollectionId !== null) {
      localStorage.setItem('vault_activeCollectionId', activeCollectionId.toString());
    } else {
      localStorage.removeItem('vault_activeCollectionId');
    }
  }, [activeCollectionId]);

  const handleLogout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      await fetch(`${baseUrl}/auth_logout.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore logout API failures; local session will still be cleared.
    } finally {
      localStorage.removeItem('vault_jwt_token');
      localStorage.removeItem('vault_lastShareToken');
      setToken(null);
      setUsername('');
      setDecodedToken(null);
      setLastShareToken('');
    }
  };

  const handleTagToggle = (tag) => {
    if (tag === 'ALL') {
      setActiveTags([]);
      return;
    }

    setActiveTags((previous) =>
      previous.includes(tag)
        ? previous.filter((item) => item !== tag)
        : [...previous, tag]
    );
  };

  const handleUpdateTags = ({ action, targetTag, newTag, sourceTag }) => {
    if (action === 'rename') {
      setPersonas((previous) =>
        previous.map((persona) => ({
          ...persona,
          tags: (persona.tags || []).map((tag) => (tag === targetTag ? newTag : tag)),
        }))
      );
      setPrompts((previous) =>
        previous.map((prompt) => ({
          ...prompt,
          tags: (prompt.tags || []).map((tag) => (tag === targetTag ? newTag : tag)),
        }))
      );
    }

    if (action === 'delete') {
      setPersonas((previous) =>
        previous.map((persona) => ({
          ...persona,
          tags: (persona.tags || []).filter((tag) => tag !== targetTag),
        }))
      );
      setPrompts((previous) =>
        previous.map((prompt) => ({
          ...prompt,
          tags: (prompt.tags || []).filter((tag) => tag !== targetTag),
        }))
      );
    }

    if (action === 'merge') {
      setPersonas((previous) =>
        previous.map((persona) => ({
          ...persona,
          tags: (persona.tags || []).map((tag) => (tag === sourceTag ? newTag : tag)),
        }))
      );
      setPrompts((previous) =>
        previous.map((prompt) => ({
          ...prompt,
          tags: (prompt.tags || []).map((tag) => (tag === sourceTag ? newTag : tag)),
        }))
      );
    }

    setGlobalToastMessage(`Tags updated! (${action})`);
  };

  const handleWorkspaceChange = (newWorkspaceId) => {
    setActiveWorkspaceId(newWorkspaceId);
    localStorage.setItem('vault_activeWorkspaceId', String(newWorkspaceId));
    setGlobalToastMessage('Switched workspace!');
    fetchPersonas();
    fetchPrompts();
    fetchCollections();
  };

  const handleCreateWorkspace = async (name) => {
    const created = await createWorkspace(name);
    if (!created) return;

    setGlobalToastMessage(`New workspace "${name}" has been made!`);
    await fetchWorkspaces();
  };

  const handleShareWorkspace = async (shareScope = 'read') => {
    if (!activeWorkspaceId) {
      setGlobalToastMessage('Select a workspace first');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces_share_create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspace_id: activeWorkspaceId,
          share_scope: shareScope,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setGlobalToastMessage(data.message || 'Failed to create share link');
        return;
      }

      const shareUrl = `${window.location.origin}/vault/share/${data.token}`;
      await navigator.clipboard.writeText(shareUrl);
      setLastShareToken(data.token);
      localStorage.setItem('vault_lastShareToken', data.token);
      const scopeLabel = (data.share_scope || shareScope || 'read').toUpperCase();
      setGlobalToastMessage(
        `Share link (${scopeLabel}) copied to clipboard (expires: ${new Date(data.expires_at).toLocaleString()})`
      );
    } catch {
      setGlobalToastMessage('Error creating share link');
    }
  };

  const handleRevokeShare = async () => {
    if (!lastShareToken || !activeWorkspaceId) {
      setGlobalToastMessage('No active share token to revoke');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces_share_revoke.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token: lastShareToken,
          workspace_id: activeWorkspaceId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setGlobalToastMessage(data.message || 'Failed to revoke share link');
        return;
      }

      setLastShareToken('');
      localStorage.removeItem('vault_lastShareToken');
      setGlobalToastMessage('Share link revoked');
    } catch {
      setGlobalToastMessage('Error revoking share link');
    }
  };

  const handleSavePersona = async (personaData) => {
    if (editingPersona?.id) {
      const updated = await updatePersona(
        personaData.id,
        personaData.name,
        personaData.description,
        personaData.tags,
        personaData.collectionIds
      );
      if (!updated) return;

      setGlobalToastMessage('Persona updated successfully!');
    } else {
      const created = await createPersona(
        personaData.name,
        personaData.description,
        personaData.tags,
        personaData.collectionIds
      );
      if (!created) return;

      setGlobalToastMessage('Persona created successfully!');
    }

    await fetchPersonas();
    setIsPersonaModalOpen(false);
    setEditingPersona(null);
  };

  if (!token) {
    return (
      <AuthLayout activeTab={authTab} onTabChange={setAuthTab}>
        {authTab === 'login' ? <LoginForm onLoginSuccess={(jwtToken) => setToken(jwtToken)} /> : <RegisterForm />}
      </AuthLayout>
    );
  }

  const favoriteCount =
    prompts.filter((prompt) => prompt.favorite === true || prompt.favorite === 1 || prompt.favorite === 'true').length +
    personas.filter((persona) => persona.favorite === true || persona.favorite === 1 || persona.favorite === 'true').length;

  const promptsWithoutTagCount = prompts.filter((prompt) => !prompt.tags || prompt.tags.length === 0).length;
  const allTags = [...personas, ...prompts]
    .flatMap((entry) => entry.tags || [])
    .filter((tag, index, array) => array.indexOf(tag) === index);
  const tagsUsed = allTags.length;

  const collectionsWithCounts = collections.map((collection) => ({
    ...collection,
    personaCount: personas.filter((persona) =>
      Array.isArray(persona.collection_ids) && persona.collection_ids.map(Number).includes(Number(collection.id))
    ).length,
  }));

  const activeWorkspace = workspaces.find((workspace) => Number(workspace.id) === Number(activeWorkspaceId)) || null;
  const activeWorkspaceRole = isAdmin ? 'admin' : (activeWorkspace?.role || 'viewer');
  const canEditWorkspace = activeWorkspaceRole === 'admin' || activeWorkspaceRole === 'editor';
  const canManageWorkspaceShares = activeWorkspaceRole === 'admin';

  return (
    <main className="min-h-screen flex pv-page-shell transition-colors duration-500">
      <Sidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 px-2 sm:px-4 pb-16 sm:pb-0">
        {globalToastMessage && (
          <div className="fixed top-4 right-4 z-[9999]">
            <Toast message={globalToastMessage} onClose={() => setGlobalToastMessage('')} />
          </div>
        )}

        <Header
          personas={personas}
          setPersonas={setPersonas}
          prompts={prompts}
          setPrompts={setPrompts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          username={username}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          createPersona={createPersona}
          createPrompt={createPrompt}
          deletePersona={deletePersona}
          deletePrompt={deletePrompt}
          handleUpdateTags={handleUpdateTags}
          isAdmin={isAdmin}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((previous) => !previous)}
          onShowToast={setGlobalToastMessage}
          canEditWorkspace={canEditWorkspace}
        />

        <div className="px-2 sm:px-4 mt-2 sm:hidden">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search..." />
        </div>

        <WorkspaceActionsBar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          activeWorkspaceRole={activeWorkspaceRole}
          canManageWorkspaceShares={canManageWorkspaceShares}
          onWorkspaceChange={handleWorkspaceChange}
          onCreateWorkspace={handleCreateWorkspace}
          onShareWorkspace={handleShareWorkspace}
          onRevokeShare={handleRevokeShare}
          hasRevokableShare={Boolean(lastShareToken)}
          onShowToast={setGlobalToastMessage}
        />

        <Suspense fallback={<div className="p-6 text-center text-sm text-gray-500">Loading workspace...</div>}>
          <VaultDashboards
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            showFavoritesOnly={showFavoritesOnly}
            setShowFavoritesOnly={setShowFavoritesOnly}
            personas={personas}
            prompts={prompts}
            activeTags={activeTags}
            onToggleTag={handleTagToggle}
            onShowToast={setGlobalToastMessage}
            loadingPersonas={loadingPersonas}
            errorPersonas={errorPersonas}
            loadingPrompts={loadingPrompts}
            errorPrompts={errorPrompts}
            collections={collections}
            collectionsWithCounts={collectionsWithCounts}
            loadingCollections={loadingCollections}
            errorCollections={errorCollections}
            personaSortOption={personaSortOption}
            setPersonaSortOption={setPersonaSortOption}
            promptSortOption={promptSortOption}
            setPromptSortOption={setPromptSortOption}
            collectionSortOption={collectionSortOption}
            setCollectionSortOption={setCollectionSortOption}
            setPersonas={setPersonas}
            setPrompts={setPrompts}
            setCollections={setCollections}
            fetchPersonas={fetchPersonas}
            fetchPrompts={fetchPrompts}
            createPersona={createPersona}
            updatePersona={updatePersona}
            deletePersona={deletePersona}
            updatePersonaFavorite={updatePersonaFavorite}
            removePersonaFromCollection={removePersonaFromCollection}
            createPrompt={createPrompt}
            updatePrompt={updatePrompt}
            deletePrompt={deletePrompt}
            updatePromptFavorite={updatePromptFavorite}
            searchTerm={searchTerm}
            defaultCollectionIdForNewPersona={defaultCollectionIdForNewPersona}
            editingPersona={editingPersona}
            isPersonaModalOpen={isPersonaModalOpen}
            setIsPersonaModalOpen={setIsPersonaModalOpen}
            setEditingPersona={setEditingPersona}
            token={token}
            activeWorkspaceId={activeWorkspaceId}
            compactMode={compactMode}
            activeCollectionId={activeCollectionId}
            setActiveCollectionId={setActiveCollectionId}
            setDefaultCollectionIdForNewPersona={setDefaultCollectionIdForNewPersona}
            createCollection={createCollection}
            renameCollection={renameCollection}
            deleteCollection={deleteCollection}
            canEditWorkspace={canEditWorkspace}
          />
        </Suspense>

        <Suspense fallback={null}>
          <AppModals
            isProfileModalOpen={isProfileModalOpen}
            decodedToken={decodedToken}
            token={token}
            personaCount={personas.length}
            personas={personas}
            prompts={prompts}
            promptCount={prompts.length}
            favoriteCount={favoriteCount}
            promptsWithoutTagCount={promptsWithoutTagCount}
            tagsUsed={tagsUsed}
            onLogout={handleLogout}
            onCloseProfile={() => setIsProfileModalOpen(false)}
            onNewPrompt={() => {
              setSelectedTab('prompts');
              setIsProfileModalOpen(false);
              setGlobalToastMessage('Start a new prompt');
            }}
            onNewPersona={() => {
              setSelectedTab('personas');
              setIsProfileModalOpen(false);
              setGlobalToastMessage('Start a new persona');
            }}
            isSettingsModalOpen={isSettingsModalOpen}
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            onCloseSettings={() => setIsSettingsModalOpen(false)}
            isAdminPanelOpen={isAdminPanelOpen}
            onCloseAdminPanel={() => setIsAdminPanelOpen(false)}
            onToast={setGlobalToastMessage}
            isPersonaModalOpen={isPersonaModalOpen}
            editingPersona={editingPersona}
            onClosePersonaModal={() => {
              setIsPersonaModalOpen(false);
              setEditingPersona(null);
            }}
            onSavePersona={handleSavePersona}
            collections={collections}
          />
        </Suspense>

        <MobileBottomNav selectedTab={selectedTab} onSelectTab={setSelectedTab} />
        <FloatingInstallBanner />
        <ScrollToTopButton />
      </div>
    </main>
  );
}

export default App;
