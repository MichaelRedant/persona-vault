import { useState } from 'react';
import { Menu } from '@headlessui/react';
import DarkModeSwitch from './DarkModeSwitch';
import AboutModal from './AboutModal';
import SearchBar from './SearchBar';
import { HiDotsVertical } from 'react-icons/hi';
import { FiUpload, FiDownload, FiInfo, FiSettings } from 'react-icons/fi';

import logoLight from '/logo-light.svg';
import logoDark from '/logo-dark.svg';
import MergeOrReplaceModal from './MergeOrReplaceModal';

export default function Header({
  personas,
  prompts,
  searchTerm,
  setSearchTerm,
  username,
  onOpenProfile,
  createPersona,
  createPrompt,
  fetchPersonas,
  fetchPrompts,
  deletePersona,
  deletePrompt,
}) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);

  const exportData = () => {
    const data = {
      personas,
      prompts,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vault_export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setPendingImportData(importedData);
          setMergeModalOpen(true);
        } catch (error) {
          console.error('Error importing:', error);
          alert('Error importing file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-100/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between max-w-5xl mx-auto px-4 py-3 gap-y-2">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src={logoLight} alt="Persona Vault Logo" className="h-12 w-auto block dark:hidden" />
            <img src={logoDark} alt="Persona Vault Logo" className="h-12 w-auto hidden dark:block" />
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden sm:block w-64">
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search..." />
            </div>

            {/* Menu */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                <HiDotsVertical className="w-5 h-5" />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1 text-sm text-gray-700 dark:text-gray-200">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={exportData}
                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm`}
                      >
                        <FiDownload className="mr-3 w-5 h-5" />
                        Export
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={importData}
                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm`}
                      >
                        <FiUpload className="mr-3 w-5 h-5" />
                        Import
                      </button>
                    )}
                  </Menu.Item>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                  {username && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onOpenProfile}
                          className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm`}
                        >
                          <FiSettings className="mr-3 w-5 h-5" />
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setIsAboutOpen(true)}
                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex items-center w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium`}
                      >
                        <FiInfo className="mr-3 w-5 h-5" />
                        About
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>

            {/* Username */}
            {username && (
              <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                Hello, {username}
              </span>
            )}

            <DarkModeSwitch />
          </div>
        </div>

        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </header>

      {/* Merge / Replace Modal */}
      <MergeOrReplaceModal
        isOpen={mergeModalOpen}
        onMerge={async () => {
          const personasToImport = Array.isArray(pendingImportData)
            ? pendingImportData
            : pendingImportData?.personas;

          const promptsToImport = Array.isArray(pendingImportData?.prompts)
            ? pendingImportData.prompts
            : [];

          // Import Personas:
          if (personasToImport) {
            for (const persona of personasToImport) {
              await createPersona(persona.name, persona.description, persona.tags || []);
            }
            await fetchPersonas();
          }

          // Import Prompts:
          if (promptsToImport.length > 0) {
            for (const prompt of promptsToImport) {
              await createPrompt(prompt.title, prompt.content, '', prompt.tags || []);
            }
            await fetchPrompts();
          }

          alert('Import merged successfully!');
          setMergeModalOpen(false);
          setPendingImportData(null);
        }}
        onReplace={async () => {
          const personasToImport = Array.isArray(pendingImportData)
            ? pendingImportData
            : pendingImportData?.personas;

          const promptsToImport = Array.isArray(pendingImportData?.prompts)
            ? pendingImportData.prompts
            : [];

          // First DELETE all personas:
          const deletePersonas = personas.map(async (p) => await deletePersona(p.id));
          await Promise.all(deletePersonas);

          // Then import Personas:
          if (personasToImport) {
            for (const persona of personasToImport) {
              await createPersona(persona.name, persona.description, persona.tags || []);
            }
          }
          await fetchPersonas();

          // DELETE all prompts:
          const deletePrompts = prompts.map(async (p) => await deletePrompt(p.id));
          await Promise.all(deletePrompts);

          // Then import Prompts:
          if (promptsToImport.length > 0) {
            for (const prompt of promptsToImport) {
              await createPrompt(prompt.title, prompt.content, '', prompt.tags || []);
            }
          }
          await fetchPrompts();

          alert('Import replaced successfully!');
          setMergeModalOpen(false);
          setPendingImportData(null);
        }}
        onCancel={() => {
          setMergeModalOpen(false);
          setPendingImportData(null);
        }}
      />
    </>
  );
}
