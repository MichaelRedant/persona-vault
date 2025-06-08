export default function SortDropdown({ sortOption, onSortChange }) {
  return (
    <div className="flex items-center mb-4">
      <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Sort by:
      </label>
      <div className="relative">
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out hover:shadow-md cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="alphabetical">Alphabetical (A-Z)</option>
          <option value="favorites">Favorites first</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-300">
          ▼
        </div>
      </div>
    </div>
  );
}
