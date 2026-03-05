import { useMemo, useState } from 'react';
import Button from '../components/Button';
import CollectionCard from '../components/CollectionCard';
import StatePanel from '../components/StatePanel';
import AddCollectionModal from './AddCollectionModal';

export default function CollectionDashboard({
  collections = [],
  loading,
  error,
  canEditWorkspace = true,
  sortOption,
  onSortChange,
  onOpenCollection,
  onAddCollection,
  onDeleteCollection,
  onRenameCollection,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = async (name) => {
    const created = await onAddCollection(name);
    if (created === false) {
      return;
    }

    setIsAddModalOpen(false);
  };

  const filteredCollections = useMemo(() => {
    let result = [...collections];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((collection) =>
        String(collection.name || '').toLowerCase().includes(normalizedSearch)
      );
    }

    if (sortOption === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'recent') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [collections, sortOption, searchTerm]);

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl pv-heading">
          Collections
          <span className="ml-2 text-sm pv-subtle">({collections.length})</span>
        </h2>

        {canEditWorkspace && (
          <Button onClick={() => setIsAddModalOpen(true)}>+ Add Collection</Button>
        )}
      </div>

      <div className="pv-panel p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div>
            <label htmlFor="collection-search" className="sr-only">Search collections</label>
            <input
              id="collection-search"
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pv-input"
            />
          </div>

          <div className="sm:w-52">
            <label htmlFor="collection-sort" className="sr-only">Sort collections</label>
            <select
              id="collection-sort"
              value={sortOption}
              onChange={(event) => onSortChange(event.target.value)}
              className="pv-input"
            >
              <option value="alphabetical">Sort: A-Z</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <StatePanel
          variant="loading"
          title="Loading collections..."
          description="Fetching your collection overview."
          className="mb-6"
        />
      )}

      {!loading && error && (
        <StatePanel
          variant="error"
          title="Could not load collections"
          description={error?.message || 'Please try again in a moment.'}
          className="mb-6"
        />
      )}

      {!loading && !error && filteredCollections.length === 0 && (
        <StatePanel
          variant="empty"
          title={searchTerm.trim() ? 'No matching collections' : 'No collections yet'}
          description={searchTerm.trim()
            ? `No collection name matches "${searchTerm}".`
            : canEditWorkspace
              ? 'Create your first collection to organize personas.'
              : 'No collections available for this workspace yet.'}
          actionLabel={searchTerm.trim() || !canEditWorkspace ? '' : 'Add Collection'}
          onAction={searchTerm.trim() || !canEditWorkspace ? undefined : () => setIsAddModalOpen(true)}
          className="mb-6"
        />
      )}

      {!loading && !error && filteredCollections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onOpenCollection={onOpenCollection}
              onDelete={onDeleteCollection}
              onRename={onRenameCollection}
              canManage={canEditWorkspace}
            />
          ))}
        </div>
      )}

      {canEditWorkspace && (
        <AddCollectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
