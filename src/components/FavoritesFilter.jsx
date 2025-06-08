export default function FavoritesFilter({
  showFavoritesOnly,
  onToggleFavorites,
  favoritesList = [],

}) {
  const activeFavoritesCount = favoritesList.filter((item) => item.favorite).length;


  return (
    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">

      <button
        onClick={() => onToggleFavorites(false)}
        className={`mr-2 mb-2 px-3 py-1 rounded-full text-sm font-medium transition-transform transform hover:scale-105 duration-200 ${
          !showFavoritesOnly
            ? 'bg-blue-600 text-white'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        }`}
      >
        All
      </button>

      <button
        onClick={() => {
          if (activeFavoritesCount > 0) {
            onToggleFavorites(true);
          }
        }}
        disabled={activeFavoritesCount === 0}
        className={`mr-2 mb-2 px-3 py-1 rounded-full text-sm font-medium transition-transform transform hover:scale-105 duration-200 ${
          showFavoritesOnly
            ? 'bg-blue-600 text-white'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        } ${activeFavoritesCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Favorites only ({activeFavoritesCount})
      </button>
    </div>
  );
}
