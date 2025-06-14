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
      Array.isArray(p.collection_ids) &&
      p.collection_ids.includes(Number(collectionId))
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
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex justify-between items-start flex-wrap gap-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {collections.find(c => c.id === collectionId)?.name || 'Collectie'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {personasInCollection.length} persona{personasInCollection.length !== 1 && 's'} in this collection
        </p>
      </div>
    

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={() => setIsAddPersonaModalOpen(true)}>
          + Add personas
        </Button>
      </div>
    </div>

    {/* Persona grid */}
    {personasInCollection.length === 0 ? (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No personas in this collection.</p>
        <p className="text-sm">Click on "Add personas" to add an existing persona to this collection.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {personasInCollection.map((persona) => (
  <div key={persona.id} className="relative flex flex-col border rounded-xl shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
    
    {/* PersonaCard zonder eigen padding, maar met content */}
    <div className="p-4 pb-2">
      <PersonaCard
        persona={persona}
        collections={collections}
        onToggleFavorite={() => onToggleFavorite(persona.id, persona.favorite)}
        onDelete={() => onDeletePersona(persona.id)}
        onEdit={() => onStartEditPersona(persona)}
        onShowToast={onShowToast}
        compactMode // optioneel activeren voor consistente hoogte
      />
    </div>

    {/* Verwijder-knop op vaste plek */}
    <div className="px-4 pt-2 pb-4 mt-auto">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => onRemovePersonaFromCollection(persona.id, collectionId)}
      >
        ❌ Delete from collection
      </Button>
    </div>
  </div>
))}
      </div>
    )}

    {/* Modal */}
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
  </div>
);

}
