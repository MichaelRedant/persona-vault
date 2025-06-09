// src/components/PromptDashboard.jsx
import Modal from './Modal';
import PromptForm from './PromptForm';
import PromptCard from './PromptCard';
import Button from './Button';
import Toast from './Toast';
import SortDropdown from './SortDropdown';
import { useState } from 'react';

export default function PromptDashboard({
  prompts,
  fetchPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  updatePromptFavorite,
  searchTerm,
  activeTags,
  showFavoritesOnly,
  sortOption,
  onShowToast,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);

  const handleSavePrompt = async (prompt) => {
    if (editingPrompt) {
      await updatePrompt(prompt.id, prompt.title, prompt.content, prompt.category, prompt.tags);
      await fetchPrompts();
      onShowToast('Prompt updated successfully!');
    } else {
      await createPrompt(prompt.title, prompt.content, prompt.category, prompt.tags);
      await fetchPrompts();
      onShowToast('Prompt created successfully!');
    }

    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  const startEdit = (prompt) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  const filteredPrompts = prompts
    .filter((prompt) =>
      (!showFavoritesOnly || prompt.favorite) &&
      (activeTags.length === 0 || (prompt.tags || []).some(tag => activeTags.includes(tag))) &&
      (prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       prompt.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOption === 'newest') return b.id - a.id;
      if (sortOption === 'oldest') return a.id - b.id;
      if (sortOption === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortOption === 'favorites') return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      return 0;
    });

  const toggleFavorite = async (id, currentFavorite) => {
    await updatePromptFavorite(id, currentFavorite ? 0 : 1);
    await fetchPrompts();
    onShowToast('Favorite updated!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Button variant="primary" onClick={() => { setEditingPrompt(null); setIsModalOpen(true); }}>
          + Add Prompt
        </Button>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No prompts found.</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        filteredPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onToggleFavorite={(id, currentFavorite) => toggleFavorite(id, currentFavorite)}
            onDelete={async () => {
              await deletePrompt(prompt.id);
              await fetchPrompts();
              onShowToast('Prompt deleted.');
            }}
            onEdit={startEdit}
            onShowToast={onShowToast}
          />
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditingPrompt(null);
      }}>
        <PromptForm onSave={handleSavePrompt} initialData={editingPrompt} />
      </Modal>
    </div>
  );
}
