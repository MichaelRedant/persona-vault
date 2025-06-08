import { useState } from 'react';

export default function CentralExportImportPanel({ personas, setPersonas, prompts, setPrompts }) {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [importDropdownOpen, setImportDropdownOpen] = useState(false);

  const handleExport = (type) => {
    const data = type === 'personas' ? personas : prompts;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportDropdownOpen(false); // Close dropdown after export
  };

  const handleImportClick = (type) => {
    // Trigger hidden file input with specific type context
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.onchange = (e) => handleImport(e, type);
    fileInput.click();
    setImportDropdownOpen(false); // Close dropdown after click
  };

  const handleImport = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          if (type === 'personas') {
            setPersonas(importedData);
            alert('Imported Personas successfully!');
          } else if (type === 'prompts') {
            setPrompts(importedData);
            alert('Imported Prompts successfully!');
          } else {
            alert('Invalid import type!');
          }
        } else {
          alert('Invalid JSON structure!');
        }
      } catch {
  alert('Invalid JSON file!');
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
              onClick={() => handleExport('personas')}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export Personas
            </button>
            <button
              onClick={() => handleExport('prompts')}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export Prompts
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
              onClick={() => handleImportClick('personas')}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Import Personas
            </button>
            <button
              onClick={() => handleImportClick('prompts')}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Import Prompts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
