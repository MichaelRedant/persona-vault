// src/components/Sidebar.jsx

import React from 'react';
import {
  FiUsers,
  FiFileText,
  FiFolder,
  FiChevronLeft,
} from 'react-icons/fi';

export default function Sidebar({ selectedTab, setSelectedTab, isOpen, setIsOpen }) {
  const navItems = [
    { id: 'personas', icon: FiUsers, label: 'Personas' },
    { id: 'prompts', icon: FiFileText, label: 'Prompts' },
    { id: 'collections', icon: FiFolder, label: 'Collections' },
  ];

  return (
    <>
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-20
          bg-white/70 dark:bg-gray-900/70
          backdrop-blur-md
          border-r border-gray-200 dark:border-gray-700
          py-6 space-y-6

          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}

          z-20
        `}
      >
        {/* Navigatieknoppen */}
        <div className="flex flex-col items-center space-y-6">
          {navItems.map(({ id, icon, label }) => {
            const active = selectedTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTab(id)}
                title={label}
                className={`
                  p-3 rounded-xl transition-colors
                  ${active
                    ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {React.createElement(icon, { className: 'w-6 h-6' })}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Toggle collapse/expand button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          fixed top-20 z-30 hidden sm:flex
          items-center justify-center
          p-1 bg-white dark:bg-gray-800
          rounded-full shadow-md
          focus:outline-none transition-transform duration-300
          ${isOpen ? 'left-20' : 'left-0'}
        `}
      >
        <FiChevronLeft
          className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${isOpen ? '' : 'rotate-180'}`}
        />
      </button>
    </>
  );
}
