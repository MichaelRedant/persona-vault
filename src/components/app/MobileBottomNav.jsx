import { useRef } from 'react';
import { FiFileText, FiFolder, FiUsers } from 'react-icons/fi';

function MobileBottomNav({ selectedTab, onSelectTab }) {
  const personasRef = useRef(null);
  const promptsRef = useRef(null);
  const collectionsRef = useRef(null);
  const tabs = ['personas', 'prompts', 'collections'];

  const focusTab = (tabId) => {
    if (tabId === 'personas') personasRef.current?.focus();
    if (tabId === 'prompts') promptsRef.current?.focus();
    if (tabId === 'collections') collectionsRef.current?.focus();
  };

  const handleTabKeyDown = (event, currentTab) => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < 0) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextTab = tabs[(currentIndex + delta + tabs.length) % tabs.length];
      onSelectTab(nextTab);
      focusTab(nextTab);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      onSelectTab('personas');
      focusTab('personas');
    }

    if (event.key === 'End') {
      event.preventDefault();
      onSelectTab('collections');
      focusTab('collections');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:hidden">
      <nav className="flex justify-around" role="tablist" aria-label="Primary mobile navigation">
        <button
          ref={personasRef}
          type="button"
          role="tab"
          aria-selected={selectedTab === 'personas'}
          aria-label="Open personas tab"
          tabIndex={selectedTab === 'personas' ? 0 : -1}
          onKeyDown={(event) => handleTabKeyDown(event, 'personas')}
          onClick={() => onSelectTab('personas')}
          className={`flex flex-col items-center flex-1 py-2 ${selectedTab === 'personas' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FiUsers className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Personas</span>
        </button>
        <button
          ref={promptsRef}
          type="button"
          role="tab"
          aria-selected={selectedTab === 'prompts'}
          aria-label="Open prompts tab"
          tabIndex={selectedTab === 'prompts' ? 0 : -1}
          onKeyDown={(event) => handleTabKeyDown(event, 'prompts')}
          onClick={() => onSelectTab('prompts')}
          className={`flex flex-col items-center flex-1 py-2 ${selectedTab === 'prompts' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FiFileText className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Prompts</span>
        </button>
        <button
          ref={collectionsRef}
          type="button"
          role="tab"
          aria-selected={selectedTab === 'collections'}
          aria-label="Open collections tab"
          tabIndex={selectedTab === 'collections' ? 0 : -1}
          onKeyDown={(event) => handleTabKeyDown(event, 'collections')}
          onClick={() => onSelectTab('collections')}
          className={`flex flex-col items-center flex-1 py-2 ${selectedTab === 'collections' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <FiFolder className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Collections</span>
        </button>
      </nav>
    </div>
  );
}

export default MobileBottomNav;
