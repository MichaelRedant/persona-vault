import { useState, useMemo } from 'react';
import Button from '../components/Button';
import AddCollectionModal from './AddCollectionModal';
import CollectionCard from '../components/CollectionCard';

export default function CollectionDashboard({
  collections = [],
  loading,
  error,
  sortOption,
  onSortChange,
  onOpenCollection,
  onAddCollection,
  onDeleteCollection,
  onRenameCollection,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (name) => {
    onAddCollection(name);
    setIsAddModalOpen(false);
  };

  const filteredCollections = useMemo(() => {
  let result = [...collections]; // shallow copy

  if (sortOption === 'alphabetical') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'recent') {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return result;
}, [collections, sortOption]);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Collections
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({collections.length})
          </span>
        </h2>

        <Button onClick={() => setIsAddModalOpen(true)}>+ Add Collection</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search collections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none"
        />

       <div className="flex justify-end mb-4">
  <div className="relative inline-block text-left">
    <select
      value={sortOption}
      onChange={(e) => onSortChange(e.target.value)}
      className="appearance-none rounded-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="alphabetical">Sort: A-Z</option>
      <option value="recent">Sort: Recent</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.586l3.71-4.356a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
</div>


      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-red-600 dark:text-red-400 font-medium mb-4">
          Error loading collections. Please try again.
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && filteredCollections.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 italic mb-6">
          No results found for "<strong>{searchTerm}</strong>".
         
        </div>
      )}

      {/* Collections Grid */}
      {!loading && !error && filteredCollections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onOpenCollection={onOpenCollection}
              onDelete={onDeleteCollection}  
              onRename={onRenameCollection}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddCollectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
