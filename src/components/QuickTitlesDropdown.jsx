import { useState, useEffect, useRef } from 'react';
import { FiList } from 'react-icons/fi';

export default function QuickTitlesDropdown({ personaItems, promptItems, onShowToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('personas'); // 'personas' or 'prompts'
  const dropdownRef = useRef(null);

  const items = selectedTab === 'personas' ? personaItems : promptItems;

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left mb-6" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
      >
        <FiList />
        <span>Quick Titles</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn border border-gray-200 dark:border-gray-700"
        >
          <div className="p-3 space-y-2">
            {/* Tabs */}
            <div className="flex space-x-2 mb-2">
              <button
                onClick={() => setSelectedTab('personas')}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium ${
                  selectedTab === 'personas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Personas ({personaItems.length})
              </button>
              <button
                onClick={() => setSelectedTab('prompts')}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium ${
                  selectedTab === 'prompts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Prompts ({promptItems.length})
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            {/* Titles list */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar mt-2">
              {filteredItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between px-3 py-1 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700"
                >
                  <span className="truncate">{item.title}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.content || '').then(() => {
                        onShowToast?.('Copied to clipboard!');
                      }).catch(err => {
                        console.error('Failed to copy:', err);
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    title="Copy description"
                  >
                    📋
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

      {/* Animations + Scrollbar */}
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
