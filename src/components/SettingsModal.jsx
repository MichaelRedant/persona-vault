import { FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function SettingsModal({ onClose, compactMode, setCompactMode }) {

  // Local state for settings

  const [defaultTab, setDefaultTab] = useState('personas');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [language, setLanguage] = useState('en');

  // Load settings from localStorage
  useEffect(() => {
  const storedCompactMode = localStorage.getItem('vault_setting_compactMode') === 'true';
  const storedDefaultTab = localStorage.getItem('vault_setting_defaultTab') || 'personas';
  const storedConfirmDelete = localStorage.getItem('vault_setting_confirmDelete') === 'true';
  const storedLanguage = localStorage.getItem('vault_setting_language') || 'en';

  setCompactMode(storedCompactMode);
  setDefaultTab(storedDefaultTab);
  setConfirmDelete(storedConfirmDelete);
  setLanguage(storedLanguage);
}, [setCompactMode]);


  // Save settings to localStorage
  const handleSave = () => {
    localStorage.setItem('vault_setting_compactMode', compactMode);
    localStorage.setItem('vault_setting_defaultTab', defaultTab);
    localStorage.setItem('vault_setting_confirmDelete', confirmDelete);
    localStorage.setItem('vault_setting_language', language);

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full text-left space-y-6 relative animate-scale-in border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FiX className="text-xl" />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h3>

        {/* General */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4 text-sm text-gray-700 dark:text-gray-200">
          <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 font-semibold">General</div>
          <label className="flex items-center space-x-2">
            <input
  type="checkbox"
  checked={compactMode}
  onChange={(e) => setCompactMode(e.target.checked)}
  className="form-checkbox h-4 w-4 text-blue-600"
/>

            <span>Compact mode</span>
          </label>
        </div>

        {/* Interface */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4 text-sm text-gray-700 dark:text-gray-200">
          <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 font-semibold">Interface</div>
          <div className="space-y-1">
            <div>Default tab on open:</div>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="defaultTab"
                value="personas"
                checked={defaultTab === 'personas'}
                onChange={(e) => setDefaultTab(e.target.value)}
              />
              <span>Personas</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="defaultTab"
                value="prompts"
                checked={defaultTab === 'prompts'}
                onChange={(e) => setDefaultTab(e.target.value)}
              />
              <span>Prompts</span>
            </label>
          </div>
        </div>

        {/* Safety */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4 text-sm text-gray-700 dark:text-gray-200">
          <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 font-semibold">Safety</div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>Confirm before deleting personas/prompts</span>
          </label>
        </div>

        {/* Language */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 font-semibold">Language</div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded px-2 py-1"
          >
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>

        <style jsx="true">{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
