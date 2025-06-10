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
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AuthLayout from './components/AuthLayout';
import { jwtDecode } from 'jwt-decode';
import Footer from './components/Footer';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import FloatingInstallBanner from './components/FloatingInstallBanner';
import TagFilterDropdown from './components/TagFilterDropdown';
import './index.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [personaSortOption, setPersonaSortOption] = useState('newest');
  const [promptSortOption, setPromptSortOption] = useState('newest');
  const [globalToastMessage, setGlobalToastMessage] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [visiblePersonas, setVisiblePersonas] = useState(20);
  const [visiblePrompts, setVisiblePrompts] = useState(20);


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
    updatePersonaFavorite
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


      fetchPersonas();
      fetchPrompts();
    } else {
      console.log('⛔️ No valid token yet → skipping fetch.');
      setUsername('');
    }
  }, [token, fetchPersonas, fetchPrompts]);

  useEffect(() => {
    localStorage.setItem('vault_selectedTab', selectedTab);
  }, [selectedTab]);

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

  

  const personaCount = personas.length;
const promptCount = prompts.length;
const favoriteCount =
  prompts.filter(p => p.favorite === true || p.favorite === 1 || p.favorite === 'true').length +
  personas.filter(p => p.favorite === true || p.favorite === 1 || p.favorite === 'true').length;

const promptsWithoutTagCount = prompts.filter(p => !p.tags || p.tags.length === 0).length;

const allTags = [...personas, ...prompts]
  .flatMap(p => p.tags || [])
  .filter((tag, i, arr) => arr.indexOf(tag) === i);

const tagsUsed = allTags.length;



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
    onTagToggle={(tag) => {
      if (tag === 'ALL') {
        setActiveTags([]);
      } else {
        setActiveTags((prev) =>
          prev.includes(tag)
            ? prev.filter((t) => t !== tag)
            : [...prev, tag]
        );
      }
    }}
  />

 {/*  <TagsFilter
    tags={[...personas.map((p) => p.tags || []), ...prompts.map((p) => p.tags || [])]}
    activeTags={activeTags}
    onTagToggle={(tag) => {
      if (tag === 'ALL') {
        setActiveTags([]);
      } else {
        setActiveTags((prev) =>
          prev.includes(tag)
            ? prev.filter((t) => t !== tag)
            : [...prev, tag]
        );
      }
    }}
  /> */}
</div>


      <div className="max-w-5xl mx-auto mb-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-2 sm:space-y-0">
          <button
            onClick={() => setSelectedTab('personas')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ease-in-out duration-200 transform ${
              selectedTab === 'personas'
                ? 'bg-blue-600 text-white scale-105 shadow-md'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            Personas
          </button>

          <button
            onClick={() => setSelectedTab('prompts')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ease-in-out duration-200 transform ${
              selectedTab === 'prompts'
                ? 'bg-blue-600 text-white scale-105 shadow-md'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            } focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            Prompts
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative min-h-[400px]">

        <div
          className={`transition-opacity duration-500 ease-in-out absolute top-0 left-0 w-full ${
            selectedTab === 'personas' ? 'opacity-100 pointer-events-auto static' : 'opacity-0 pointer-events-none'
          }`}
        >
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
            personas={personas.slice(0, visiblePersonas)}
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
            onLoadMore={() => setVisiblePersonas((prev) => prev + 10)}
          />
        </div>

        <div
          className={`transition-opacity duration-500 ease-in-out absolute top-0 left-0 w-full ${
            selectedTab === 'prompts' ? 'opacity-100 pointer-events-auto static' : 'opacity-0 pointer-events-none'
          }`}
        >
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
            prompts={prompts.slice(0, visiblePrompts)}
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
            onLoadMore={() => setVisiblePrompts((prev) => prev + 10)}
          />
        </div>
      </div>

      {isProfileModalOpen && decodedToken && (
  <ProfileModal
  decodedToken={decodedToken}
  personaCount={personaCount}
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



{/*   <Footer
  username={username}
  personasCount={personas.length}
  promptsCount={prompts.length}
  onOpenSettings={() => setIsSettingsModalOpen(true)}
/> */}
<FloatingInstallBanner />
    </main>
  );
}

export default App;
