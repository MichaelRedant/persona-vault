const TABS = [
  { id: 'personas', label: 'Personas' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'collections', label: 'Collections' },
];

function DesktopTabs({ selectedTab, onSelectTab }) {
  return (
    <div className="hidden sm:block max-w-screen-xl mx-auto px-2 sm:px-4 mb-8 mt-4">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onSelectTab(id)}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold tracking-tight transition-all duration-200 ${
              selectedTab === id
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DesktopTabs;
