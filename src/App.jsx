/* eslint-disable react-hooks/exhaustive-deps */
import PersonaDashboard from './components/PersonaDashboard';
import PromptDashboard from './components/PromptDashboard';
import TagsFilter from './components/TagsFilter';
import SortDropdown from './components/SortDropdown';
import FavoritesFilter from './components/FavoritesFilter';
import Header from './components/Header';
import Toast from './components/Toast';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePersonasApi } from './hooks/usePersonasApi';
import { usePromptsApi } from './hooks/usePromptsApi';
import { useCollectionsApi } from './hooks/useCollectionsApi';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AuthLayout from './components/AuthLayout';
import { jwtDecode } from 'jwt-decode';
import Footer from './components/Footer';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import FloatingInstallBanner from './components/FloatingInstallBanner';
import TagFilterDropdown from './components/TagFilterDropdown';
import QuickTitlesDropdown from './components/QuickTitlesDropdown.jsx';
import ScrollToTopButton from './components/ScrollToTopButton';
import AdminPanelModal from './components/AdminPanelModal';
import CollectionDashboard from './pages/CollectionDashboard';
import CollectionPage from './pages/CollectionPage';
import Modal from './components/Modal';
import PersonaForm from './components/PersonaForm';
import './index.css';
import { testTokenValid } from './utils/tokenChecker';
import { useWorkspacesApi } from './hooks/useWorkspacesApi';
import { FiUsers, FiFileText, FiFolder } from 'react-icons/fi';
import Sidebar from './components/Sidebar';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [collectionSortOption, setCollectionSortOption] = useState('alphabetical');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [personaSortOption, setPersonaSortOption] = useState('newest');
  const [promptSortOption, setPromptSortOption] = useState('newest');
  const [globalToastMessage, setGlobalToastMessage] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState(() => {
  const storedId = localStorage.getItem('vault_activeCollectionId');
  


  return storedId ? Number(storedId) : null;
});
  const [defaultCollectionIdForNewPersona, setDefaultCollectionIdForNewPersona] = useState(null); // → wordt meegegeven aan PersonaDashboard → defaultCollectionId prop

  useEffect(() => {
  const msg = sessionStorage.getItem('vault_logout_message');
  if (msg) {
    setGlobalToastMessage(msg);
    sessionStorage.removeItem('vault_logout_message');
  }
}, []);


  const [selectedTab, setSelectedTab] = useState(() => {
    return localStorage.getItem('vault_selectedTab') || 'personas';
  });

  const [compactMode, setCompactMode] = useState(() => {
  return localStorage.getItem('vault_setting_compactMode') === 'true';
});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const updateSidebar = () => {
      setIsSidebarOpen(window.innerWidth >= 640);
    };
    updateSidebar();
    window.addEventListener('resize', updateSidebar);
    return () => window.removeEventListener('resize', updateSidebar);
  }, []);

useEffect(() => {
  const token = localStorage.getItem('vault_jwt_token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!token || token.length < 100 || !token.startsWith('eyJ')) {
    console.log('🔐 No valid token format found');
    return;
  }

  const alreadyChecked = sessionStorage.getItem('vault_token_checked');
  if (alreadyChecked) {
    console.log('🔄 Token already checked this session');
    return;
  }

  const checkToken = async () => {
    console.log('🧪 Checking token validity...');
    const isValid = await testTokenValid(baseUrl, token);
    if (!isValid) {
      console.warn('❌ Token invalid → logging out');
      sessionStorage.setItem('vault_token_checked', '1');
      localStorage.removeItem('vault_jwt_token');
      sessionStorage.setItem('vault_logout_message', 'Your session has expired, please log in again.');
      window.location.reload(); 
    } else {
      sessionStorage.setItem('vault_token_checked', '1');
      console.log('✅ Token is valid');
    }
  };

  checkToken();
}, []);

useEffect(() => {
  const handleStorageChange = () => {
    setCompactMode(localStorage.getItem('vault_setting_compactMode') === 'true');
  };

  window.addEventListener('storage', handleStorageChange);
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);

const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
  const fromStorage = localStorage.getItem('vault_activeWorkspaceId');
  return fromStorage ? parseInt(fromStorage, 10) : null;
});
const [token, setToken] = useState(() => localStorage.getItem('vault_jwt_token') || null);

const {
  workspaces,
  fetchWorkspaces,
  createWorkspace,
  // loading: loadingWorkspaces
} = useWorkspacesApi(token, setGlobalToastMessage);

useEffect(() => {
  if (!token) return;

  (async () => {
    const fetched = await fetchWorkspaces();
    const storedWorkspaceIdStr = localStorage.getItem('vault_activeWorkspaceId');
    const storedWorkspaceId =
      storedWorkspaceIdStr ? parseInt(storedWorkspaceIdStr, 10) : null;
    const validStoredId =
      storedWorkspaceId && fetched.some((w) => Number(w.id) === storedWorkspaceId);

    if (validStoredId) {
      setActiveWorkspaceId(storedWorkspaceId);
    } else if (fetched.length > 0) {
      const fallbackId = Number(fetched[0].id);
      setActiveWorkspaceId(fallbackId);
      localStorage.setItem('vault_activeWorkspaceId', String(fallbackId));
    }
  })();
}, [token, fetchWorkspaces]);




  
  const [decodedToken, setDecodedToken] = useState(null);
  
  // 🚀 NEW → Username state
  const [username, setUsername] = useState('');

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
    updatePromptFavorite
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
  if (token) {
    try {
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);
      setUsername(decoded.username || decoded.email || 'User');
      setIsAdmin(!!decoded.is_admin);

      if (!activeWorkspaceId && decoded.workspace_id) {
        setActiveWorkspaceId(decoded.workspace_id);
        localStorage.setItem('vault_activeWorkspaceId', decoded.workspace_id);
      }

      console.log('✅ JWT Decoded:', decoded);
      console.log('✅ workspaceId from token:', decoded.workspace_id);
      console.log('✅ activeWorkspaceId in state:', activeWorkspaceId); // <- voeg deze toe

      fetchPersonas();
      fetchPrompts();
      fetchCollections();
    } catch (err) {
      console.error('❌ Error decoding token or fetching data:', err);
      setGlobalToastMessage('Error during token processing.');
    }
  }
}, [token, fetchPersonas, fetchCollections, fetchPrompts]);



  const personaCount = personas.length;
  const promptCount = prompts.length;
  const collectionsWithCounts = collections.map((col) => ({
  ...col,
  personaCount: personas.filter((p) =>
  Array.isArray(p.collection_ids) &&
  p.collection_ids.map(Number).includes(Number(col.id))
).length,
}));

  useEffect(() => {
  const displayUsername = username ? `${username}'s Vault` : 'Persona Vault';
  document.title = `${displayUsername} (${personaCount} Personas | ${promptCount} Prompts)`;
}, [personaCount, promptCount, username]);

useEffect(() => {
  if (selectedTab === 'collectionDetail' && activeCollectionId !== null) {
    console.log('Force fetchPersonas for collectionDetail view');
    fetchPersonas();
  }
}, [selectedTab, activeCollectionId, fetchPersonas, fetchCollections]);

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


  const location = useLocation();
  const [authTab, setAuthTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('register') ? 'register' : 'login';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('register')) {
      setAuthTab('register');
    }
  }, [location.search]);

  if (!token) {
    return (
      <AuthLayout activeTab={authTab} onTabChange={setAuthTab}>
        {authTab === 'login' ? (
          <LoginForm onLoginSuccess={(token) => setToken(token)} />
        ) : (
          <RegisterForm />
        )}
      </AuthLayout>
    );
  }
  
  
 const handleLogout = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    await fetch(`${baseUrl}/auth_logout.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    localStorage.removeItem('vault_jwt_token');
    setToken(null);
    setUsername('');
    setDecodedToken(null);
  }
};
  



const favoriteCount =
  prompts.filter(p => p.favorite === true || p.favorite === 1 || p.favorite === 'true').length +
  personas.filter(p => p.favorite === true || p.favorite === 1 || p.favorite === 'true').length;


const promptsWithoutTagCount = prompts.filter(p => !p.tags || p.tags.length === 0).length;

const allTags = [...personas, ...prompts]
  .flatMap(p => p.tags || [])
  .filter((tag, i, arr) => arr.indexOf(tag) === i);

const tagsUsed = allTags.length;


const handleTagToggle = (tag) => {
  if (tag === 'ALL') {
    setActiveTags([]);
  } else {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }
};

const handleUpdateTags = ({ action, targetTag, newTag, sourceTag }) => {
  if (action === 'rename') {
    setPersonas(prev => prev.map(p => ({
      ...p,
      tags: (p.tags || []).map(t => t === targetTag ? newTag : t)
    })));
    setPrompts(prev => prev.map(p => ({
      ...p,
      tags: (p.tags || []).map(t => t === targetTag ? newTag : t)
    })));
  }

  if (action === 'delete') {
    setPersonas(prev => prev.map(p => ({
      ...p,
      tags: (p.tags || []).filter(t => t !== targetTag)
    })));
    setPrompts(prev => prev.map(p => ({
      ...p,
      tags: (p.tags || []).filter(t => t !== targetTag)
    })));
  }

  if (action === 'merge') {
    setPersonas(prev => prev.map(p => ({
      ...p,
      tags: (p.tags || []).map(t => t === sourceTag ? newTag : t)
    })));
    setPrompts(prev => prev.map(p => ({
      ...p,
      tags: (p.tags || []).map(t => t === sourceTag ? newTag : t)
    })));
  }

  setGlobalToastMessage(`Tags updated! (${action})`);
};



  return (
      <main className="min-h-screen flex bg-gradient-to-br from-white via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
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
        createPersona={createPersona} // ✅ toevoegen
        createPrompt={createPrompt}   // ✅ toevoegen
        deletePersona={deletePersona}    // ✅ toevoegen
        deletePrompt={deletePrompt}
        handleUpdateTags={handleUpdateTags}
        isAdmin={isAdmin}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

{workspaces.length > 0 && (
  <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-2 mt-4 flex justify-between items-center">
    <div className="flex items-center space-x-2 text-sm">
      <label htmlFor="workspaceSelect" className="text-gray-700 dark:text-gray-300 font-medium">
        Workspace:
      </label>
      <div className="relative">
        <select
          id="workspaceSelect"
          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-1.5 pr-8 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out hover:shadow-md cursor-pointer"
          value={activeWorkspaceId || ''}
          onChange={(e) => {
            const newId = parseInt(e.target.value, 10);
            setActiveWorkspaceId(newId);
            localStorage.setItem('vault_activeWorkspaceId', String(newId));
            setGlobalToastMessage('Switched workspace!');
            fetchPersonas();
            fetchPrompts();
            fetchCollections();
          }}
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-300">
          ▼
        </div>
      </div>
    </div>

    <div className="flex items-center">
      <button
        className="ml-4 mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-all"
        onClick={() => {
          const name = prompt('Name your workspace:');
          if (name && name.trim().length > 1) {
            createWorkspace(name.trim()).then(() => {
              setGlobalToastMessage(`New workspace "${name}" has been made!`);
              fetchWorkspaces();
            });
          }
        }}
      >
        + New workspace
      </button>
      <button
        className="ml-2 mt-2 px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-all"
        onClick={async () => {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces_share_create.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ workspace_id: activeWorkspaceId }),
            });
            const data = await res.json();
            if (data.success) {
              const shareUrl = `${window.location.origin}/vault/share/${data.token}`;
              await navigator.clipboard.writeText(shareUrl);
              setGlobalToastMessage('Share link copied to clipboard');
            } else {
              setGlobalToastMessage(data.message || 'Failed to create share link');
            }
          } catch (err) {
            console.error(err);
            setGlobalToastMessage('Error creating share link');
          }
        }}
      >
        Share
      </button>
    </div>
  </div>
)}



      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-4 mt-6">
        <FavoritesFilter
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={setShowFavoritesOnly}
          favoritesList={selectedTab === 'personas' ? personas : prompts}
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-4 flex flex-wrap gap-2 items-center">
  <TagFilterDropdown
    tags={[...personas.map((p) => p.tags || []), ...prompts.map((p) => p.tags || [])]}
    activeTags={activeTags}
    onTagToggle={handleTagToggle}
  />
  <QuickTitlesDropdown
    personaItems={personas.map(p => ({ title: p.name, content: p.description }))}
    promptItems={prompts.map(p => ({ title: p.title, content: p.content }))}
    onShowToast={setGlobalToastMessage} // ✅ toevoegen zodat toast kan getoond worden
/>

</div>



     <div className="hidden sm:block max-w-screen-xl mx-auto px-2 sm:px-4 mb-8 mt-4">

  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
    {[
      { id: 'personas', label: 'Personas' },
      { id: 'prompts', label: 'Prompts' },
      { id: 'collections', label: 'Collections' },
    ].map(({ id, label }) => (
      <button
        key={id}
        onClick={() => setSelectedTab(id)}
        className={`px-3 py-1.5 rounded-md text-sm font-semibold tracking-tight transition-all duration-200
          ${selectedTab === id
            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
            : 'bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
          }`}
      >
        {label}
      </button>
    ))}
  </div>
</div>


{/* Independent scrolling blocks → fix for issue */}

{selectedTab === 'collectionDetail' && loadingPersonas ? (
  // Industry clean: show loading only
  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
    Loading personas in this collection...
  </div>
) : selectedTab === 'collectionDetail' && !loadingPersonas ? (
  // Collection Detail page → full width page
  <CollectionPage
  collectionId={activeCollectionId}
  personas={personas}
  collections={collections}
  loadingPersonas={loadingPersonas}
  onBack={() => setSelectedTab('collections')}
  onAddPersonaToCollection={(collectionId) => {
    setSelectedTab('personas');
    setDefaultCollectionIdForNewPersona(collectionId);
    console.log('Open PersonaForm with defaultCollectionId:', collectionId);
  }}
  onAssignPersonasToCollection={async (personaIds, collectionId) => {
  for (const id of personaIds) {
    const persona = personas.find(p => p.id === id);
    if (persona) {
      await updatePersona(
        id,
        persona.name,
        persona.description,
        persona.tags,
        [...(persona.collection_ids || []), collectionId]
      );
    }
  }
  await fetchPersonas();
  setGlobalToastMessage('Personas assigned to collection!');
}}
  onRemovePersonaFromCollection={async (personaId, collectionId) => {
  try {
    await removePersonaFromCollection(personaId, collectionId);
    await fetchPersonas();
    setGlobalToastMessage('Persona removed from collection!');
  } catch (err) {
    console.error('Failed to remove persona from collection:', err);
    setGlobalToastMessage('Error removing from collection');
  }
}}

  onShowToast={setGlobalToastMessage}
  onToggleFavorite={async (personaId, favorite) => {
    await updatePersonaFavorite(personaId, favorite ? 0 : 1);
    await fetchPersonas(); // ✅ refresh so favorite count etc updates
    setGlobalToastMessage('Favorite updated!');
  }}
  onDeletePersona={async (personaId) => {
    if (window.confirm('Are you sure you want to delete this persona?')) {
      await deletePersona(personaId);
      await fetchPersonas();
      setGlobalToastMessage('Persona deleted.');
    }
  }}
  onStartEditPersona={(persona) => {
  const fullPersona = personas.find(p => p.id === persona.id); // volledige data met collection_ids
  console.log('✏️ EDITING PERSONA:', fullPersona); // debug

  if (!fullPersona) {
    setGlobalToastMessage('Persona data not found');
    return;
  }

  setEditingPersona(fullPersona);
  setIsPersonaModalOpen(true);
  setGlobalToastMessage(`Editing persona "${fullPersona.name}"...`);
}}


/>


) : (
  // Normal Dashboards wrapper
  <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-16">
    {/* Persona Dashboard */}
    <div className={`${selectedTab === 'personas' ? 'block' : 'hidden'}`}>
      <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mb-2 flex items-center space-x-2">
          <span>Persona Dashboard</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">({personas.length})</span>
        </h2>

        <SortDropdown
          sortOption={personaSortOption}
          onSortChange={setPersonaSortOption}
        />
      </div>

      {loadingPersonas && (
        <p className="text-center text-sm text-gray-500 mb-4">Loading personas...</p>
      )}
      {errorPersonas && (
        <p className="text-center text-sm text-red-500 mb-4">Error loading personas</p>
      )}

      <PersonaDashboard
        personas={personas}
        setPersonas={setPersonas}
        fetchPersonas={fetchPersonas}
        createPersona={createPersona}
        updatePersona={updatePersona}
        deletePersona={deletePersona}
        updatePersonaFavorite={updatePersonaFavorite}
        searchTerm={searchTerm}
        activeTags={activeTags}
        showFavoritesOnly={showFavoritesOnly}
        sortOption={personaSortOption}
        onShowToast={setGlobalToastMessage}
        onSortChange={setPersonaSortOption}
        compactMode={compactMode}
        defaultCollectionId={defaultCollectionIdForNewPersona}
        collections={collections}
        editingPersona={editingPersona}
isModalOpen={isPersonaModalOpen}
setIsModalOpen={setIsPersonaModalOpen}
setEditingPersona={setEditingPersona}
token={token}

      />
    </div>

    {/* Prompt Dashboard */}
    <div className={`${selectedTab === 'prompts' ? 'block' : 'hidden'}`}>
      <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mb-2 flex items-center space-x-2">
          <span>Prompt Dashboard</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">({prompts.length})</span>
        </h2>

        <SortDropdown
          sortOption={promptSortOption}
          onSortChange={setPromptSortOption}
        />
      </div>

      {loadingPrompts && (
        <p className="text-center text-sm text-gray-500 mb-4">Loading prompts...</p>
      )}
      {errorPrompts && (
        <p className="text-center text-sm text-red-500 mb-4">Error loading prompts</p>
      )}

      <PromptDashboard
        prompts={prompts}
        setPrompts={setPrompts}
        fetchPrompts={fetchPrompts}
        createPrompt={createPrompt}
        updatePrompt={updatePrompt}
        deletePrompt={deletePrompt}
        updatePromptFavorite={updatePromptFavorite}
        searchTerm={searchTerm}
        onShowToast={setGlobalToastMessage}
        activeTags={activeTags}
        showFavoritesOnly={showFavoritesOnly}
        sortOption={promptSortOption}
        setSortOption={setPromptSortOption}
        compactMode={compactMode}
      />
    </div>

    {/* Collections Dashboard */}
    <div className={`${selectedTab === 'collections' ? 'block' : 'hidden'}`}>
      <CollectionDashboard
  collections={collectionsWithCounts}
  setCollections={setCollections}
  loading={loadingCollections}
  error={errorCollections}
  sortOption={collectionSortOption}
  onSortChange={setCollectionSortOption}
  onOpenCollection={(collectionId) => {
    setActiveCollectionId(collectionId);
    setSelectedTab('collectionDetail');
  }}
  onAddCollection={(name) => {
    createCollection(name);
  }}
  onRenameCollection={async (id, newName) => {
    const updated = collections.map((c) =>
      c.id === id ? { ...c, name: newName } : c
    );
    setCollections(updated);
    const success = await renameCollection(id, newName);
    if (success) {
      setGlobalToastMessage(`Collectie hernoemd naar "${newName}"`);
    } else {
      setGlobalToastMessage('Error renaming collection');
    }
  }}
  onDeleteCollection={(id) => {
    deleteCollection(id);
    setGlobalToastMessage('Collectie verwijderd!');
  }}
/>
    </div>
  </div>
)}



      {isProfileModalOpen && decodedToken && (
  <ProfileModal
  decodedToken={decodedToken}
  personaCount={personaCount}
  personas={personas}   // <--- DIT TOEVOEGEN
  prompts={prompts} 
  promptCount={promptCount}
  favoriteCount={favoriteCount}
  promptsWithoutTagCount={promptsWithoutTagCount}
  tagsUsed={tagsUsed}
  onLogout={handleLogout}
  onClose={() => setIsProfileModalOpen(false)}
  onNewPrompt={() => {
    setSelectedTab('prompts');
    setIsProfileModalOpen(false);
    setGlobalToastMessage('Start a new prompt 🎯');
  }}
  onNewPersona={() => {
    setSelectedTab('personas');
    setIsProfileModalOpen(false);
    setGlobalToastMessage('Start a new persona 🎭');
  }}
  onExport={() => {
    const data = { personas, prompts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vault_export.json';
    link.click();
    URL.revokeObjectURL(url);
  }}
/>

)}

{isSettingsModalOpen && (
  <SettingsModal
    onClose={() => setIsSettingsModalOpen(false)}
    compactMode={compactMode}
    setCompactMode={setCompactMode}
  />
)}

{isAdminPanelOpen && (
  <AdminPanelModal
    isOpen={isAdminPanelOpen}
    onClose={() => setIsAdminPanelOpen(false)}
    token={token}
    onToast={setGlobalToastMessage}
  />
)}

{isPersonaModalOpen && editingPersona && (
  <Modal
    isOpen={isPersonaModalOpen}
    onClose={() => {
      setIsPersonaModalOpen(false);
      setEditingPersona(null);
    }}
  >
    <PersonaForm
      key={editingPersona ? editingPersona.id : 'new'}
      onSave={async (personaData) => {
        if (editingPersona.id) {
          // Update flow
          await updatePersona(
            
            personaData.id,
            personaData.name,
            personaData.description,
            personaData.tags,
            personaData.collectionIds
          );
          setGlobalToastMessage('Persona updated successfully!');
        } else {
          // Create flow
          await createPersona(
            personaData.name,
            personaData.description,
            personaData.tags,
            personaData.collectionIds
          );
          setGlobalToastMessage('Persona created successfully!');
        }

        await fetchPersonas();
        setIsPersonaModalOpen(false);
        setEditingPersona(null);
      }}
      initialData={editingPersona}
      collections={collections}
      
    />
  </Modal>
)}


{/*   <Footer
  username={username}
  personasCount={personas.length}
  promptsCount={prompts.length}
  onOpenSettings={() => setIsSettingsModalOpen(true)}
/> */}
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:hidden">
        <nav className="flex justify-around">
          <button
            onClick={() => setSelectedTab('personas')}
            className={`flex flex-col items-center flex-1 py-2 ${selectedTab === 'personas' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <FiUsers className="h-6 w-6" />
            <span className="text-xs">Personas</span>
          </button>
          <button
            onClick={() => setSelectedTab('prompts')}
            className={`flex flex-col items-center flex-1 py-2 ${selectedTab === 'prompts' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <FiFileText className="h-6 w-6" />
            <span className="text-xs">Prompts</span>
          </button>
          <button
            onClick={() => setSelectedTab('collections')}
            className={`flex flex-col items-center flex-1 py-2 ${selectedTab === 'collections' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <FiFolder className="h-6 w-6" />
            <span className="text-xs">Collections</span>
          </button>
        </nav>
      </div>
<FloatingInstallBanner />
      <ScrollToTopButton />
      </div>
    </main>
 );
  }

export default App;
