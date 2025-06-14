import PersonaDashboard from './components/PersonaDashboard';
import PromptDashboard from './components/PromptDashboard';
import TagsFilter from './components/TagsFilter';
import SortDropdown from './components/SortDropdown';
import FavoritesFilter from './components/FavoritesFilter';
import Header from './components/Header';
import Toast from './components/Toast';
import { useState, useEffect } from 'react';
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
import CollectionDashboard from './pages/CollectionDashboard';
import CollectionPage from './pages/CollectionPage';
import Modal from './components/Modal';
import PersonaForm from './components/PersonaForm';
import './index.css';

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
  const [activeCollectionId, setActiveCollectionId] = useState(() => {
  const storedId = localStorage.getItem('vault_activeCollectionId');


  return storedId ? Number(storedId) : null;
});
  const [defaultCollectionIdForNewPersona, setDefaultCollectionIdForNewPersona] = useState(null); // → wordt meegegeven aan PersonaDashboard → defaultCollectionId prop

  


  const [selectedTab, setSelectedTab] = useState(() => {
    return localStorage.getItem('vault_selectedTab') || 'personas';
  });

  const [compactMode, setCompactMode] = useState(() => {
  return localStorage.getItem('vault_setting_compactMode') === 'true';
});

useEffect(() => {
  const handleStorageChange = () => {
    setCompactMode(localStorage.getItem('vault_setting_compactMode') === 'true');
  };

  window.addEventListener('storage', handleStorageChange);
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);



  const [token, setToken] = useState(() => localStorage.getItem('vault_jwt_token') || null);
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
  } = usePersonasApi(token, setGlobalToastMessage);

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
  } = usePromptsApi(token, setGlobalToastMessage);

  const {
  collections,
  setCollections,
  loading: loadingCollections,
  error: errorCollections,
  createCollection,
  deleteCollection,
  fetchCollections,
} = useCollectionsApi(token, setGlobalToastMessage);
  

  useEffect(() => {
    console.log('TOKEN IN APP:', token);

    if (token && typeof token === 'string' && token.length > 100 && token.startsWith('eyJ')) {
      console.log('✅ Valid token → fetching data...');

      try {
  const decoded = jwtDecode(token);
  setDecodedToken(decoded);
  setUsername(decoded.username || decoded.email || 'User');
} catch (err) {
  console.error('Invalid token:', err); // ← nu err gebruikt
  setDecodedToken(null);
  setUsername('');
}



      fetchPersonas().then(() => {
      setTimeout(() => {
        console.log('📦 personas after fetch →', personas);
      }, 500); // even kleine delay om zeker te zijn dat state is geüpdatet
    });
      fetchPrompts();
      fetchCollections();
    } else {
      console.log('⛔️ No valid token yet → skipping fetch.');
      setUsername('');
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


  const [authTab, setAuthTab] = useState('login');

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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500 px-2 sm:px-4">


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
  onOpenProfile={() => setIsProfileModalOpen(true)}
  createPersona={createPersona} // ✅ toevoegen
  createPrompt={createPrompt}   // ✅ toevoegen
  deletePersona={deletePersona}    // ✅ toevoegen
  deletePrompt={deletePrompt} 
  handleUpdateTags={handleUpdateTags}
  
/>


      <div className="max-w-5xl mx-auto mb-4 mt-6">
        <FavoritesFilter
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={setShowFavoritesOnly}
          favoritesList={selectedTab === 'personas' ? personas : prompts}
        />
      </div>

      <div className="max-w-5xl mx-auto mb-4 flex flex-wrap gap-2 items-center">
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


     <div className="max-w-5xl mx-auto mb-8 mt-4">
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
  <div className="max-w-5xl mx-auto mb-16">
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
  onRenameCollection={(id, newName) => {
    const updated = collections.map((c) =>
      c.id === id ? { ...c, name: newName } : c
    );
    setCollections(updated);
    setGlobalToastMessage(`Collectie hernoemd naar "${newName}"`);
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
  onLogout={() => {
    localStorage.removeItem('vault_jwt_token');
    setToken(null);
    setUsername('');
    setDecodedToken(null);
  }}
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
<FloatingInstallBanner />
<ScrollToTopButton />

    </main>
  );
}

export default App;
