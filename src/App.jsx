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
import './index.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [personaSortOption, setPersonaSortOption] = useState('newest');
  const [promptSortOption, setPromptSortOption] = useState('newest');
  const [globalToastMessage, setGlobalToastMessage] = useState('');

  // NEW: Tab state
  const [selectedTab, setSelectedTab] = useState(() => {
    return localStorage.getItem('vault_selectedTab') || 'personas';
  });

  // Hooks → API
  const {
  personas,
  loading: loadingPersonas,
  error: errorPersonas,
  setPersonas,
  fetchPersonas,   // <--- ADD THIS LINE!
} = usePersonasApi(setGlobalToastMessage);

const {
  prompts,
  loading: loadingPrompts,
  error: errorPrompts,
  setPrompts,
  fetchPrompts,   // <--- ADD THIS LINE!
} = usePromptsApi(setGlobalToastMessage);

  // Save selected tab to localStorage
  useEffect(() => {
    localStorage.setItem('vault_selectedTab', selectedTab);
  }, [selectedTab]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-500 px-2 sm:px-4">

      {/* Global Toast */}
      {globalToastMessage && (
        <div className="fixed top-4 right-4 z-[9999]">
          <Toast message={globalToastMessage} onClose={() => setGlobalToastMessage('')} />
        </div>
      )}

      {/* Sticky Header */}
      <Header
        personas={personas}
        prompts={prompts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Favorites Toggle */}
      <div className="max-w-5xl mx-auto mb-4 mt-6">
        <FavoritesFilter
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={setShowFavoritesOnly}
          favoritesList={selectedTab === 'personas' ? personas : prompts}
        />
      </div>

      {/* Tags Filter */}
      <div className="max-w-5xl mx-auto mb-4">
        <TagsFilter
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
      </div>

      {/* Tabs */}
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

      {/* Dashboards */}
      <div className="max-w-5xl mx-auto relative min-h-[400px]">

        {/* Persona Dashboard */}
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

          {/* Loading / Error UI */}
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
            searchTerm={searchTerm}
            activeTags={activeTags}
            showFavoritesOnly={showFavoritesOnly}
            sortOption={personaSortOption}
            onShowToast={setGlobalToastMessage}
            onSortChange={setPersonaSortOption}
          />
        </div>

        {/* Prompt Dashboard */}
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

          {/* Loading / Error UI */}
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
            searchTerm={searchTerm}
            onShowToast={setGlobalToastMessage}
            activeTags={activeTags}
            showFavoritesOnly={showFavoritesOnly}
            sortOption={promptSortOption}
            setSortOption={setPromptSortOption}
          />
        </div>

      </div>
    </main>
  );
}

export default App;
