import { useState, useEffect, useRef } from 'react';
import { FiFilter } from 'react-icons/fi';

export default function TagFilterDropdown({ tags, activeTags, onTagToggle }) {
  const uniqueTags = Array.from(new Set(tags.flat()));
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null); // 🟡 → ref for click outside

  const filteredTags = uniqueTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearAll = () => {
    activeTags.forEach(tag => {
      onTagToggle(tag);
    });
  };

  // 🟡 Handle click outside → close dropdown
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
    <div className="relative inline-block text-left mb-6 mr-4" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
      >
        <FiFilter />
        <span>Filter Tags</span>
        {activeTags.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
            {activeTags.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn border border-gray-200 dark:border-gray-700"
        >
          <div className="p-3 space-y-2">

            {/* Top bar → Search */}
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            {/* Clear All link */}
            {activeTags.length > 0 && (
              <div
                className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer mt-2 mb-1 hover:underline transition"
                onClick={handleClearAll}
              >
                Clear All ({activeTags.length})
              </div>
            )}

            {/* Tag list */}
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

      {/* Animation + Scrollbar styling */}
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
