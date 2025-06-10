import Modal from './Modal';
import PromptForm from './PromptForm';
import PromptCard from './PromptCard';
import Button from './Button';
import { useState, useEffect, useRef } from 'react';

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
  onShowToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // ✅ voeg isEditing toe
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef();

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

  const hasMore = visibleCount < filteredPrompts.length;

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
  }, [filteredPrompts.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, activeTags, showFavoritesOnly]);

  const handleSavePrompt = async (prompt) => {
    if (editingPrompt) {
      await updatePrompt(prompt.id, prompt.title, prompt.content, prompt.category, prompt.tags);
      onShowToast('Prompt updated successfully!');
    } else {
      await createPrompt(prompt.title, prompt.content, prompt.category, prompt.tags);
      onShowToast('Prompt created successfully!');
    }

    await fetchPrompts();
    setIsModalOpen(false);
    setEditingPrompt(null);
    setIsEditing(false);

    // 🧹 Clear draft after save
    localStorage.removeItem('vault_draft_prompt');
  };

  const startEdit = (prompt) => {
    setEditingPrompt(prompt);
    setIsEditing(true); // ✅ we zitten in edit mode
    setIsModalOpen(true);
  };

  const startCreate = () => {
    setEditingPrompt(null);
    setIsEditing(false); // ✅ we zitten in add mode → laat draft staan
    setIsModalOpen(true);
  };

  const toggleFavorite = async (id, currentFavorite) => {
    await updatePromptFavorite(id, currentFavorite ? 0 : 1);
    await fetchPrompts();
    onShowToast('Favorite updated!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Button variant="primary" onClick={startCreate}>
          + Add Prompt
        </Button>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No prompts found.</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        filteredPrompts.slice(0, visibleCount).map((prompt) => (
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
        setEditingPrompt(null);

        // 🧹 Alleen clear draft als we in edit mode waren
        if (isEditing) {
          localStorage.removeItem('vault_draft_prompt');
        }

        setIsEditing(false);
      }}>
        <PromptForm
          key={editingPrompt ? editingPrompt.id : 'new'}
          onSave={handleSavePrompt}
          initialData={editingPrompt}
        />
      </Modal>
    </div>
  );
}
