import { FiTrash2 } from 'react-icons/fi';
import CollectionOptionsDropdown from './CollectionOptionsDropdown';

export default function CollectionCard({ collection, onOpenCollection, onDelete,
  onRename }) {

  return (
    <div
      onClick={() => onOpenCollection(collection.id)}
      className="group relative border border-gray-200 dark:border-gray-600 rounded-2xl p-5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
  <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
    {collection.name}
  </h3>

  <CollectionOptionsDropdown
  collection={collection}
  onRename={onRename}         // ✅ dit moet al werken
  onDelete={onDelete}         // ✅ dit was vergeten
/>
</div>

      {/* 🏷 Naam */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 truncate">
        {collection.name}
      </h3>

      {/* 📊 Badges */}
      <div className="flex flex-wrap gap-2 text-sm">
        {/* Aantal personas badge */}
        <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
          👤 {collection.personaCount ?? 0} persona{collection.personaCount === 1 ? '' : 's'}
        </span>

        {/* Datum badge */}
        <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
          📅 {collection.created_at
            ? new Date(collection.created_at).toLocaleDateString()
            : '—'}
        </span>
      </div>
    </div>
  );
}
