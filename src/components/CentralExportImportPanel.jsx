// src/components/CentralExportImportPanel.jsx
import { useState } from 'react';

export default function CentralExportImportPanel({ personas, setPersonas, prompts, setPrompts }) {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [importDropdownOpen, setImportDropdownOpen] = useState(false);

  const handleExport = () => {
    const vaultData = {
      personas,
      prompts,
    };

    const jsonStr = JSON.stringify(vaultData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vault_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportDropdownOpen(false); // Close dropdown after export
  };

  const handleImportClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.onchange = (e) => handleImport(e);
    fileInput.click();
    setImportDropdownOpen(false); // Close dropdown after click
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // ✅ Vault structure check
        if (importedData.personas && importedData.prompts) {
          setPersonas(importedData.personas);
          setPrompts(importedData.prompts);
          alert('Vault import successful!');
        } else {
          alert('Invalid Vault file: expected { personas, prompts } structure.');
        }
      } catch (error) {
        console.error('Error importing Vault:', error);
        alert('Error reading file.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex space-x-4 mt-6 justify-center relative">
      {/* Export Dropdown */}
      <div className="relative inline-block text-left">
        <button
          onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 focus:outline-none"
        >
          Export
        </button>

        {exportDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
            <button
              onClick={handleExport}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export Vault
            </button>
          </div>
        )}
      </div>

      {/* Import Dropdown */}
      <div className="relative inline-block text-left">
        <button
          onClick={() => setImportDropdownOpen(!importDropdownOpen)}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 focus:outline-none"
        >
          Import
        </button>

        {importDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
            <button
              onClick={handleImportClick}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Import Vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
