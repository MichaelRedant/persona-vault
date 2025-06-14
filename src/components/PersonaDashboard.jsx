import Modal from './Modal';
import PersonaForm from './PersonaForm';
import PersonaCard from './PersonaCard';
import Button from './Button';
import { useState, useEffect, useRef } from 'react';

export default function PersonaDashboard({
  personas,
  fetchPersonas,
  createPersona,
  updatePersona,
  updatePersonaFavorite,
  deletePersona,
  searchTerm,
  activeTags,
  showFavoritesOnly,
  sortOption,
  onShowToast,
  collections,
  defaultCollectionId = null
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // ✅ nieuw → track Add of Edit mode
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef();

  const filteredPersonas = personas
    .filter((item) =>
      (!showFavoritesOnly || item.favorite) &&
      (activeTags.length === 0 || (item.tags || []).some(tag => activeTags.includes(tag))) &&
      (
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortOption === 'newest') return b.id - a.id;
      if (sortOption === 'oldest') return a.id - b.id;
      if (sortOption === 'alphabetical') return a.name.localeCompare(b.name);
      if (sortOption === 'favorites') return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      return 0;
    });

  const hasMore = visibleCount < filteredPersonas.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  useEffect(() => {
    const currentElement = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1 }
    );

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [filteredPersonas.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, activeTags, showFavoritesOnly]);

  const handleSavePersona = async (persona) => {
  const collectionId =
    editingPersona && editingPersona.collectionId !== undefined
      ? editingPersona.collectionId
      : defaultCollectionId;

  const collectionIds = persona.collectionIds || persona.collection_ids || [];

  const personaToSave = {
    ...persona,
    collectionId,
    collectionIds, // ✅ DIT toevoegen
  };

  if (editingPersona) {
    await updatePersona(
      personaToSave.id,
      personaToSave.name,
      personaToSave.description,
      personaToSave.tags,
      personaToSave.collectionIds // ✅ Gebruik collectionIds hier!
    );
    onShowToast('Persona updated successfully!');
  } else {
    await createPersona(
  personaToSave.name,
  personaToSave.description,
  personaToSave.tags,
  personaToSave.collectionIds // ✅ volledige array!
);
    onShowToast('Persona created successfully!');
  }

  await fetchPersonas();
  setIsModalOpen(false);
  setEditingPersona(null);
  setIsEditing(false);
  localStorage.removeItem('vault_draft_persona');
};

  const startEdit = (persona) => {
  const enrichedPersona = {
    ...persona,
    collectionIds:
      Array.isArray(persona.collectionIds) ? persona.collectionIds :
      Array.isArray(persona.collection_ids) ? persona.collection_ids :
      (typeof persona.collection_id === 'number' ? [persona.collection_id] : [])
  };

  console.log("✏️ EDITING enrichedPersona:", enrichedPersona); // ✅ check hier
  setEditingPersona(enrichedPersona);
  setIsEditing(true);
  setIsModalOpen(true);
};



  const startCreate = () => {
    setEditingPersona(null);
    setIsEditing(false); // ✅ we zitten in add mode → laat draft bestaan
    setIsModalOpen(true);
  };

  const toggleFavorite = async (id, currentFavorite) => {
    await updatePersonaFavorite(id, currentFavorite ? 0 : 1);
    await fetchPersonas();
    onShowToast('Favorite updated!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Button onClick={startCreate}>+ Add Persona</Button>
      </div>

      {filteredPersonas.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No personas found.</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        filteredPersonas.slice(0, visibleCount).map((persona) => (
  <PersonaCard
    key={persona.id}
    persona={persona}
    collections={collections}
    onToggleFavorite={toggleFavorite}
    onDelete={async () => {
      await deletePersona(persona.id);
      await fetchPersonas();
      onShowToast('Persona deleted.');
    }}
    onEdit={startEdit}
    onShowToast={onShowToast}
  />
))
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="h-16 flex justify-center items-center">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
          </div>
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading more...</span>
        </div>
      )}

      {/* Modal met key om form te resetten */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditingPersona(null);

        // 🧹 Alleen clear draft als we in edit mode waren
        if (isEditing) {
          localStorage.removeItem('vault_draft_persona');
        }

        setIsEditing(false);
      }}>
        <PersonaForm
  key={editingPersona ? editingPersona.id : 'new'}
  onSave={handleSavePersona}
  initialData={
  editingPersona
    ? {
        ...editingPersona,
        collectionIds: editingPersona.collectionIds || [],
      }
    : {
        collectionId: defaultCollectionId,
        collectionIds: defaultCollectionId ? [defaultCollectionId] : []
      }
}
  collections={collections}
/>
      </Modal>
    </div>
  );
}
