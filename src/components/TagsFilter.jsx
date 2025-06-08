export default function TagsFilter({ tags, activeTags, onTagToggle }) {
  const uniqueTags = Array.from(new Set(tags.flat()));

  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-2 px-1 -mx-1 mb-6 scrollbar-hide">
      {/* "All" Button */}
      <button
        onClick={() => onTagToggle('ALL')}
        className={`flex-shrink-0 cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all ease-in-out duration-200 ${
          activeTags.length === 0
            ? 'bg-blue-600 text-white scale-105 shadow-sm'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
        }`}
      >
        All
      </button>

      {/* Tag buttons */}
      {uniqueTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagToggle(tag)}
          className={`flex-shrink-0 cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all ease-in-out duration-200 ${
            activeTags.includes(tag)
              ? 'bg-blue-600 text-white scale-105 shadow-sm'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
