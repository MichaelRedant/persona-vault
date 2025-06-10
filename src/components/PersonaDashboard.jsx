// src/components/PersonaDashboard.jsx
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
  onShowToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef();

  // Filtered personas → FIRST define this:
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

// "Has more" logic → important for Lazy Load trigger
const hasMore = visibleCount < filteredPersonas.length;

// Load more function
const handleLoadMore = () => {
  setVisibleCount((prev) => prev + 20);
};

// Observer for infinite scroll
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

// 🚀 UX polish: Reset visibleCount when search or filters change
useEffect(() => {
  setVisibleCount(20);
}, [searchTerm, activeTags, showFavoritesOnly]);
  const handleSavePersona = async (persona) => {
    if (editingPersona) {
      await updatePersona(persona.id, persona.name, persona.description, persona.tags);
      await fetchPersonas();
      onShowToast('Persona updated successfully!');
    } else {
      await createPersona(persona.name, persona.description, persona.tags);
      await fetchPersonas();
      onShowToast('Persona created successfully!');
    }

    setIsModalOpen(false);
    setEditingPersona(null);
  };

  const startEdit = (persona) => {
    setEditingPersona(persona);
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
        <Button onClick={() => { setEditingPersona(null); setIsModalOpen(true); }}>
          + Add Persona
        </Button>
      </div>

      {/* Empty state */}
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

      {/* Lazy Loading Trigger */}
     {hasMore && (
  <div ref={loadMoreRef} className="h-16 flex justify-center items-center">
    <div className="relative w-6 h-6">
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"></div>
      <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
    </div>
    <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading more...</span>
  </div>
)}



      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditingPersona(null);
      }}>
        <PersonaForm onSave={handleSavePersona} initialData={editingPersona} />
      </Modal>
    </div>
  );
}
