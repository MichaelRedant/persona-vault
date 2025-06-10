import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCopy } from 'react-icons/fi';

export default function QuickTitlesModal({ isOpen, onClose, personaTitles = [], promptTitles = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('personas'); // or 'prompts'
  const modalRef = useRef();

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const currentList = tab === 'personas'
    ? Array.isArray(personaTitles) ? personaTitles : []
    : Array.isArray(promptTitles) ? promptTitles : [];

  const filteredTitles = currentList.filter(title =>
    title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-slideIn"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Titles</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setTab('personas')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              tab === 'personas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Personas
          </button>
          <button
            onClick={() => setTab('prompts')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              tab === 'prompts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Prompts
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search titles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Title List */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {filteredTitles.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">No matching titles.</p>
          ) : (
            filteredTitles.map((title, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-800 dark:text-white group hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <span className="truncate max-w-[85%]">{title}</span>
                <button
                  onClick={() => handleCopy(title)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                  title="Copy title"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
