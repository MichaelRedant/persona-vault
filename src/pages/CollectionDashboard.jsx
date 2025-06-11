import { useState } from 'react';
import Button from '../components/Button'; // → als je deze al hebt → consistent met Vault
import AddCollectionModal from './AddCollectionModal'; // → als je deze al hebt
import CollectionCard from '../components/CollectionCard';

export default function CollectionDashboard({
  collections,
  loading,
  error,
  onOpenCollection,
  onAddCollection,
  onDeleteCollection,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          Collections ({collections.length})
        </h2>

        <Button onClick={() => setIsAddModalOpen(true)}>+ Add Collection</Button>
      </div>

      {loading && (
        <p className="text-center text-gray-500 mb-4">Loading collections...</p>
      )}

      {error && (
        <p className="text-center text-red-500 mb-4">Error loading collections</p>
      )}

      {!loading && !error && collections.length === 0 && (
        <p className="text-center text-gray-500 mb-4">No collections found.</p>
      )}

      {!loading && !error && collections.length > 0 && (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {collections.map((collection) => (
    <CollectionCard
      key={collection.id}
      collection={collection}
      onOpenCollection={onOpenCollection}
      onDeleteCollection={onDeleteCollection}
    />
  ))}
</div>
      )}

      {isAddModalOpen && (
        <AddCollectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(name) => {
            onAddCollection(name); // → Prop call → je App.jsx → createCollection()
            setIsAddModalOpen(false); // Close modal after add
          }}
        />
      )}
    </div>
  );
}
