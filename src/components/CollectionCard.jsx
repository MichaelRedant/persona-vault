import CollectionOptionsDropdown from './CollectionOptionsDropdown';

export default function CollectionCard({
  collection,
  onOpenCollection,
  onDelete,
  onRename,
  canManage = true,
}) {
  const personaCount = Number(collection.personaCount || 0);
  const createdLabel = collection.created_at
    ? new Date(collection.created_at).toLocaleDateString()
    : 'Unknown';

  return (
    <div
      onClick={() => onOpenCollection(collection.id)}
      className="group relative cursor-pointer pv-card p-5"
    >
      <div className="flex justify-between items-start gap-3 mb-4">
        <h3 className="text-xl font-semibold truncate pv-heading">
          {collection.name}
        </h3>

        {canManage && (
          <CollectionOptionsDropdown
            collection={collection}
            onRename={onRename}
            onDelete={onDelete}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="pv-chip">
          {personaCount} persona{personaCount === 1 ? '' : 's'}
        </span>

        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/70 dark:text-gray-200">
          Created {createdLabel}
        </span>
      </div>
    </div>
  );
}
