// src/components/PersonaDashboard.jsx
import Modal from './Modal';
import PersonaForm from './PersonaForm';
import PersonaCard from './PersonaCard';
import Button from './Button';
import Toast from './Toast';
import SortDropdown from './SortDropdown';

import { useState } from 'react';
import { usePersonasApi } from '../hooks/usePersonasApi';

export default function PersonaDashboard({
  personas,
  fetchPersonas,
  searchTerm,
  activeTags,
  showFavoritesOnly,
  sortOption,
  onShowToast,
}) {
  const {
    loading,
    createPersona,
    updatePersona,
    updatePersonaFavorite,
    deletePersona,
  } = usePersonasApi(onShowToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);

  const handleSavePersona = async (persona) => {
    if (editingPersona) {
      await updatePersona(persona.id, persona.name, persona.description, persona.tags);
      await fetchPersonas(); // 🔥 Refresh list after save → also updates tags/favorites
      onShowToast('Persona updated successfully!');
    } else {
      await createPersona(persona.name, persona.description, persona.tags);
      await fetchPersonas(); // 🔥 Refresh list after create → also updates tags/favorites
      onShowToast('Persona created successfully!');
    }

    setIsModalOpen(false);
    setEditingPersona(null);
  };

  const startEdit = (persona) => {
    setEditingPersona(persona);
    setIsModalOpen(true);
  };

  // 🟢 Filtered + sorted personas → als constante
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

  // 🟢 Simuleer favorite toggle lokaal → en refresh App.jsx → TagsFilter + FavoritesFilter work
  const toggleFavorite = async (id, currentFavorite) => {
    await updatePersonaFavorite(id, currentFavorite ? 0 : 1);
    await fetchPersonas(); // 🔥 Important → makes App.jsx get updated → FavoritesFilter and TagsFilter update
    onShowToast('Favorite updated!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditingPersona(null); setIsModalOpen(true); }}>
          + Add Persona
        </Button>
      </div>

      {/* 🟢 Show loading state */}
      {loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Loading personas...</p>
        </div>
      )}

      {/* 🟢 Show empty state if needed */}
      {!loading && filteredPersonas.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No personas found.</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        filteredPersonas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            onToggleFavorite={toggleFavorite}
            onDelete={async () => {
              await deletePersona(persona.id);
              await fetchPersonas(); // 🔥 Also after delete → update TagsFilter and FavoritesFilter
              onShowToast('Persona deleted.');
            }}
            onEdit={startEdit}
            onShowToast={onShowToast}
          />
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditingPersona(null);
      }}>
        <PersonaForm onSave={handleSavePersona} initialData={editingPersona} />
      </Modal>
    </div>
  );
}
