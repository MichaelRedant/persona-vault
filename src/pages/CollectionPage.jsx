import { useMemo, useState } from 'react';
import Button from '../components/Button';
import ListingManageModal from '../components/ListingManageModal';
import PersonaCard from '../components/PersonaCard';
import StatePanel from '../components/StatePanel';
import { useMarketplaceApi } from '../hooks/useMarketplaceApi';
import AddExistingPersonaModal from './AddExistingPersonaModal';

export default function CollectionPage({
  collectionId,
  personas,
  collections,
  loadingPersonas,
  onBack,
  onAssignPersonasToCollection,
  onRemovePersonaFromCollection,
  onToggleFavorite,
  onDeletePersona,
  onStartEditPersona,
  onShowToast,
  token,
  canEditWorkspace = true,
}) {
  const [isAddPersonaModalOpen, setIsAddPersonaModalOpen] = useState(false);
  const [uploadingPersona, setUploadingPersona] = useState(null);

  const { createListing, uploadFile } = useMarketplaceApi(token);
  const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '');

  const personasInCollection = useMemo(() => {
    if (!collectionId || !Array.isArray(personas)) return [];

    return personas.filter(
      (persona) =>
        Array.isArray(persona.collection_ids) &&
        persona.collection_ids.includes(Number(collectionId))
    );
  }, [collectionId, personas]);

  if (loadingPersonas) {
    return (
      <div className="p-6">
        <StatePanel
          variant="loading"
          title="Loading personas..."
          description="Fetching collection content."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            {collections.find((collection) => collection.id === collectionId)?.name || 'Collection'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {personasInCollection.length} persona{personasInCollection.length !== 1 && 's'} in this collection
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          {canEditWorkspace && (
            <Button onClick={() => setIsAddPersonaModalOpen(true)}>
              + Add personas
            </Button>
          )}
        </div>
      </div>

      {personasInCollection.length === 0 ? (
        <StatePanel
          variant="empty"
          title="No personas in this collection"
          description={canEditWorkspace
            ? 'Use "Add personas" to include existing personas in this collection.'
            : 'No personas available in this collection for your current filters.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {personasInCollection.map((persona) => (
            <div
              key={persona.id}
              className="relative flex flex-col border rounded-xl shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div className="p-4 pb-2">
                <PersonaCard
                  persona={persona}
                  collections={collections}
                  onToggleFavorite={() => onToggleFavorite(persona.id, persona.favorite)}
                  onDelete={() => onDeletePersona(persona.id)}
                  onEdit={() => onStartEditPersona(persona)}
                  onShowToast={onShowToast}
                  onUpload={(entry) => setUploadingPersona(entry)}
                  canEditWorkspace={canEditWorkspace}
                  compactMode
                />
              </div>

              {canEditWorkspace && (
                <div className="px-4 pt-2 pb-4 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onRemovePersonaFromCollection(persona.id, collectionId)}
                  >
                    Remove from collection
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canEditWorkspace && (
        <AddExistingPersonaModal
          isOpen={isAddPersonaModalOpen}
          onClose={() => setIsAddPersonaModalOpen(false)}
          personas={personas}
          collectionId={collectionId}
          onAssignPersonasToCollection={(personaIds) => {
            onAssignPersonasToCollection(personaIds, collectionId);
            onShowToast('Personas toegevoegd aan collectie!');
            setIsAddPersonaModalOpen(false);
          }}
        />
      )}

      <ListingManageModal
        open={!!uploadingPersona}
        onClose={() => setUploadingPersona(null)}
        initial={uploadingPersona ? {
          title: uploadingPersona.name,
          description: stripHtml(uploadingPersona.description),
          item_type: 'persona',
          item_id: uploadingPersona.id,
          tags: Array.isArray(uploadingPersona.tags)
            ? uploadingPersona.tags.join(',')
            : (uploadingPersona.tags || ''),
        } : {}}
        uploadFn={uploadFile}
        lockItemSelection
        onSave={async (payload) => {
          try {
            await createListing({ ...payload, currency: 'EUR', visibility: 'public' });
            setUploadingPersona(null);
            onShowToast('Uploaded to marketplace!');
          } catch (error) {
            onShowToast(error?.message || 'Failed to upload to marketplace');
          }
        }}
      />
    </div>
  );
}
