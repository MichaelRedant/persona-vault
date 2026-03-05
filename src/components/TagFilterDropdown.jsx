import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiFilter } from 'react-icons/fi';

export default function TagFilterDropdown({ tags, activeTags, onTagToggle }) {
  const uniqueTags = useMemo(() => Array.from(new Set(tags.flat())), [tags]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const panelId = useId();

  const filteredTags = uniqueTags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearAll = () => {
    activeTags.forEach((tag) => {
      onTagToggle(tag);
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    searchRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="relative inline-block mb-6" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <FiFilter />
        <span>Filter Tags</span>
        {activeTags.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
            {activeTags.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label="Tag filters"
          className="absolute z-50 mt-2 w-64 pv-panel focus:outline-none animate-fadeIn"
        >
          <div className="p-3 space-y-2">
            <label htmlFor={`tag-search-${panelId}`} className="sr-only">Search tags</label>
            <input
              ref={searchRef}
              id={`tag-search-${panelId}`}
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pv-input text-sm"
            />

            {activeTags.length > 0 && (
              <button
                type="button"
                className="text-xs text-blue-600 dark:text-blue-400 mt-2 mb-1 hover:underline transition"
                onClick={handleClearAll}
              >
                Clear All ({activeTags.length})
              </button>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredTags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-200 px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <input
                    type="checkbox"
                    checked={activeTags.includes(tag)}
                    onChange={() => onTagToggle(tag)}
                    className="form-checkbox text-blue-600"
                  />
                  <span>{tag}</span>
                </label>
              ))}

              {filteredTags.length === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-2 text-center">No tags found.</div>
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
