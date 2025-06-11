import { useState, useMemo } from 'react';
import Button from '../components/Button';
import PersonaCard from '../components/PersonaCard';
import AddExistingPersonaModal from './AddExistingPersonaModal';

export default function CollectionPage({
  collectionId,
  personas,
  collections, // ✅ toevoegen → industry correct
  loadingPersonas,
  onBack,
  onAssignPersonasToCollection,
  onRemovePersonaFromCollection,
  onToggleFavorite,
  onDeletePersona,
  onStartEditPersona,
  onShowToast,
}) {
  const [isAddPersonaModalOpen, setIsAddPersonaModalOpen] = useState(false);

  const personasInCollection = useMemo(() => {
    if (!collectionId || !Array.isArray(personas)) return [];

    return personas.filter(
      (p) =>
        p.collection_id !== null &&
        p.collection_id !== undefined &&
        Number(p.collection_id) === Number(collectionId)
    );
  }, [collectionId, personas]);

  if (loadingPersonas) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading personas in this collection...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          Collection Details
        </h2>

        <Button variant="outline" onClick={onBack}>
          ← Back to Collections
        </Button>
      </div>

      {/* Add Persona buttons */}
      <div className="flex flex-wrap justify-end mb-6 space-x-2">
        <Button onClick={() => setIsAddPersonaModalOpen(true)}>
          + Add Personas to this Collection
        </Button>
      </div>

      {/* Personas grid */}
      {personasInCollection.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No personas in this collection.</p>
          <p className="text-sm">Click "Add Persona" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {personasInCollection.map((persona) => (
            <div key={persona.id} className="relative">
              <PersonaCard
                persona={persona}
                collections={collections}
                onToggleFavorite={() => onToggleFavorite(persona.id, persona.favorite)}
                onDelete={() => onDeletePersona(persona.id)}
                onEdit={() => onStartEditPersona(persona)}
                onShowToast={onShowToast}
              />

              {/* Remove from Collection button */}
              <div className="mt-2 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => onRemovePersonaFromCollection(persona.id)}
                >
                  Remove from Collection
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Existing Persona Modal */}
      <AddExistingPersonaModal
        isOpen={isAddPersonaModalOpen}
        onClose={() => setIsAddPersonaModalOpen(false)}
        personas={personas}
        collectionId={collectionId}
        onAssignPersonasToCollection={(personaIds) => {
          onAssignPersonasToCollection(personaIds, collectionId);
          onShowToast('Personas assigned to collection!');
          setIsAddPersonaModalOpen(false);
        }}
      />
    </div>
  );
}
