import { FiTrash2 } from 'react-icons/fi';

export default function CollectionCard({ collection, onOpenCollection, onDeleteCollection }) {
  return (
    <div
      className="relative border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition cursor-pointer"
      onClick={() => onOpenCollection(collection.id)}
    >
      {/* Delete button rechtsboven */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // belangrijk → anders opent de collection
          if (window.confirm('Are you sure you want to delete this collection?')) {
            onDeleteCollection(collection.id);
          }
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
      >
        <FiTrash2 className="text-lg" />
      </button>

      {/* Naam */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {collection.name}
      </h3>

      {/* Created date */}
      <p>
  Created:{' '}
  {collection.created_at
    ? new Date(collection.created_at).toLocaleDateString()
    : '—'}
</p>

    </div>
  );
}
