import { useState } from 'react';
import { FiCopy } from 'react-icons/fi';

export default function QuickTitleList({ personas, prompts }) {
  const [activeTab, setActiveTab] = useState('personas');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Titel gekopieerd: ${text}`);
  };

  const titles = activeTab === 'personas'
    ? personas.map(p => p.name).filter(Boolean)
    : prompts.map(p => p.title).filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-w-md mx-auto shadow-md mb-8">
      <div className="flex justify-center mb-4 space-x-2">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === 'personas' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          onClick={() => setActiveTab('personas')}
        >
          Personas
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === 'prompts' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          onClick={() => setActiveTab('prompts')}
        >
          Prompts
        </button>
      </div>

      <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        {titles.length === 0 && <li className="text-gray-500 text-center py-2">Geen titels gevonden.</li>}
        {titles.map((title, index) => (
          <li
            key={index}
            className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
            onClick={() => handleCopy(title)}
          >
            <span className="truncate">{title}</span>
            <FiCopy className="w-4 h-4 text-gray-400" />
          </li>
        ))}
      </ul>
    </div>
  );
}
