import { useId } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function SortDropdown({ sortOption, onSortChange, label = 'Sort by' }) {
  const selectId = useId();

  return (
    <div className="flex items-center mb-4">
      <label htmlFor={selectId} className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-label={label}
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
          className="pv-input pv-input-pill appearance-none px-4 py-2 pr-8 text-sm shadow-sm cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="alphabetical">Alphabetical (A-Z)</option>
          <option value="favorites">Favorites first</option>
        </select>
        <FiChevronDown
          className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400 dark:text-gray-300"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
