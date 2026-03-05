import { useEffect, useId, useRef, useState } from 'react';
import { FiClipboard, FiList } from 'react-icons/fi';

export default function QuickTitlesDropdown({ personaItems = [], promptItems = [], onShowToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('personas');
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const personasTabRef = useRef(null);
  const promptsTabRef = useRef(null);
  const panelId = useId();
  const titleId = `${panelId}-title`;
  const personasTabId = `${panelId}-personas-tab`;
  const promptsTabId = `${panelId}-prompts-tab`;
  const tabPanelId = `${panelId}-panel`;

  const currentItems = selectedTab === 'personas' ? personaItems : promptItems;
  const filteredItems = (Array.isArray(currentItems) ? currentItems : []).filter((item) =>
    String(item?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    searchRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleCopy = async (item) => {
    const textToCopy = String(item?.content || item?.title || '').trim();
    if (!textToCopy) {
      onShowToast?.('Nothing to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      onShowToast?.('Copied to clipboard!');
    } catch {
      onShowToast?.('Copy failed.');
    }
  };

  const switchTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleTabKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    if (selectedTab === 'personas') {
      setSelectedTab('prompts');
      promptsTabRef.current?.focus();
    } else {
      setSelectedTab('personas');
      personasTabRef.current?.focus();
    }
  };

  return (
    <div className="relative inline-block mb-6" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <FiList aria-hidden="true" />
        <span>Quick Titles</span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="absolute z-50 mt-2 w-72 pv-panel focus:outline-none animate-fadeIn"
        >
          <div className="p-3 space-y-2">
            <h3 id={titleId} className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Quick Titles
            </h3>

            <div role="tablist" aria-label="Select title source" className="flex space-x-2 mb-2">
              <button
                ref={personasTabRef}
                id={personasTabId}
                type="button"
                role="tab"
                aria-selected={selectedTab === 'personas'}
                aria-controls={tabPanelId}
                tabIndex={selectedTab === 'personas' ? 0 : -1}
                onClick={() => switchTab('personas')}
                onKeyDown={handleTabKeyDown}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selectedTab === 'personas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Personas ({Array.isArray(personaItems) ? personaItems.length : 0})
              </button>
              <button
                ref={promptsTabRef}
                id={promptsTabId}
                type="button"
                role="tab"
                aria-selected={selectedTab === 'prompts'}
                aria-controls={tabPanelId}
                tabIndex={selectedTab === 'prompts' ? 0 : -1}
                onClick={() => switchTab('prompts')}
                onKeyDown={handleTabKeyDown}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selectedTab === 'prompts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Prompts ({Array.isArray(promptItems) ? promptItems.length : 0})
              </button>
            </div>

            <label htmlFor={`${panelId}-search`} className="sr-only">Search titles</label>
            <input
              ref={searchRef}
              id={`${panelId}-search`}
              type="text"
              placeholder="Search titles..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pv-input text-sm"
            />

            <div
              id={tabPanelId}
              role="tabpanel"
              aria-labelledby={selectedTab === 'personas' ? personasTabId : promptsTabId}
              className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar mt-2"
            >
              {filteredItems.map((item) => (
                <div
                  key={`${selectedTab}-${item?.title}`}
                  className="flex items-center justify-between gap-2 px-3 py-1 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700"
                >
                  <span className="truncate">{item?.title}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title="Copy content"
                    aria-label={`Copy content for ${item?.title || 'item'}`}
                  >
                    <FiClipboard aria-hidden="true" />
                  </button>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-2 text-center">No titles found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(100, 100, 100, 0.3);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(100, 100, 100, 0.5);
        }
      `}</style>
    </div>
  );
}
