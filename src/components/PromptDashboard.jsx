import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import ListingManageModal from './ListingManageModal';
import Modal from './Modal';
import PromptCard from './PromptCard';
import PromptForm from './PromptForm';
import RevisionsModal from './RevisionsModal';
import StatePanel from './StatePanel';
import Tooltip from './Tooltip';
import { useMarketplaceApi } from '../hooks/useMarketplaceApi';
import { usePromptRevisionsApi } from '../hooks/usePromptRevisionsApi';

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
  token,
  workspaceId,
  canEditWorkspace = true,
  workspaceTagSuggestions = [],
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedPromptChanges, setHasUnsavedPromptChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedPromptForRevisions, setSelectedPromptForRevisions] = useState(null);
  const [uploadingPrompt, setUploadingPrompt] = useState(null);
  const loadMoreRef = useRef();

  const { revisions, loading: loadingRevisions, fetchRevisions } = usePromptRevisionsApi(
    token,
    workspaceId,
    onShowToast
  );
  const { createListing, uploadFile } = useMarketplaceApi(token);
  const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '');

  const filteredPrompts = prompts
    .filter((prompt) =>
      (!showFavoritesOnly || prompt.favorite) &&
      (activeTags.length === 0 || (prompt.tags || []).some((tag) => activeTags.includes(tag))) &&
      (
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortOption === 'newest') return b.id - a.id;
      if (sortOption === 'oldest') return a.id - b.id;
      if (sortOption === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortOption === 'favorites') return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      return 0;
    });

  const hasMore = visibleCount < filteredPrompts.length;

  useEffect(() => {
    const currentElement = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { threshold: 1 }
    );

    if (currentElement) observer.observe(currentElement);
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, [filteredPrompts.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, activeTags, showFavoritesOnly]);

  const closePromptModal = ({ discardDraft = false } = {}) => {
    setIsModalOpen(false);
    setEditingPrompt(null);
    setIsEditing(false);
    setHasUnsavedPromptChanges(false);
    setShowDiscardConfirm(false);
    if (discardDraft || isEditing) {
      localStorage.removeItem('vault_draft_prompt');
    }
  };

  const requestClosePromptModal = () => {
    if (hasUnsavedPromptChanges) {
      setShowDiscardConfirm(true);
      return;
    }

    closePromptModal();
  };

  const handleSavePrompt = async (prompt) => {
    if (!canEditWorkspace) {
      return;
    }

    if (editingPrompt) {
      const updated = await updatePrompt(prompt.id, prompt.title, prompt.content, prompt.category, prompt.tags);
      if (!updated) return;
      onShowToast('Prompt updated successfully!');
    } else {
      const created = await createPrompt(prompt.title, prompt.content, prompt.category, prompt.tags);
      if (!created) return;
      onShowToast('Prompt created successfully!');
    }

    await fetchPrompts();
    closePromptModal({ discardDraft: true });
  };

  const startEdit = (prompt) => {
    if (!canEditWorkspace) {
      return;
    }

    setEditingPrompt(prompt);
    setIsEditing(true);
    setHasUnsavedPromptChanges(false);
    setIsModalOpen(true);
  };

  const startCreate = () => {
    if (!canEditWorkspace) {
      return;
    }

    setEditingPrompt(null);
    setIsEditing(false);
    setHasUnsavedPromptChanges(false);
    setIsModalOpen(true);
  };

  const toggleFavorite = async (id, currentFavorite) => {
    if (!canEditWorkspace) {
      return;
    }

    const updated = await updatePromptFavorite(id, currentFavorite ? 0 : 1);
    if (!updated) return;

    await fetchPrompts();
    onShowToast('Favorite updated!');
  };

  const openRevisionsModal = async (prompt) => {
    await fetchRevisions(prompt.id);
    setSelectedPromptForRevisions(prompt);
  };

  return (
    <div className="p-4 sm:p-6">
      {canEditWorkspace && (
        <div className="flex justify-end mb-6">
          <Tooltip text="Create a new prompt">
            <Button variant="primary" onClick={startCreate}>
              + Add Prompt
            </Button>
          </Tooltip>
        </div>
      )}

      {filteredPrompts.length === 0 ? (
        <StatePanel
          variant="empty"
          title="No prompts found"
          description={canEditWorkspace
            ? 'Create your first prompt or adjust your filters.'
            : 'Adjust your filters to explore available prompts.'}
          actionLabel={canEditWorkspace ? 'Create Prompt' : ''}
          onAction={canEditWorkspace ? startCreate : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPrompts.slice(0, visibleCount).map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onToggleFavorite={(id, currentFavorite) => toggleFavorite(id, currentFavorite)}
              onDelete={async () => {
                if (!canEditWorkspace) return;
                const deleted = await deletePrompt(prompt.id);
                if (!deleted) return;

                await fetchPrompts();
                onShowToast('Prompt deleted.');
              }}
              onEdit={startEdit}
              onViewRevisions={() => openRevisionsModal(prompt)}
              onShowToast={onShowToast}
              onUpload={(entry) => {
                if (!canEditWorkspace) return;
                setUploadingPrompt(entry);
              }}
              canEditWorkspace={canEditWorkspace}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="h-16 flex justify-center items-center">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600" />
          </div>
          <span className="ml-3 text-sm pv-subtle">Loading more...</span>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={requestClosePromptModal}
      >
        <PromptForm
          key={editingPrompt ? editingPrompt.id : 'new'}
          onSave={handleSavePrompt}
          initialData={editingPrompt}
          workspaceTagSuggestions={workspaceTagSuggestions}
          onDirtyChange={setHasUnsavedPromptChanges}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => closePromptModal({ discardDraft: true })}
        title="Discard unsaved prompt changes?"
        description="Your unsaved changes will be lost if you close this form."
      />

      <RevisionsModal
        isOpen={!!selectedPromptForRevisions}
        onClose={() => setSelectedPromptForRevisions(null)}
        revisions={revisions}
        loading={loadingRevisions}
        currentItem={selectedPromptForRevisions}
        type="prompt"
        onRollback={async (revision) => {
          if (!canEditWorkspace) return;
          const rolledBack = await updatePrompt(
            selectedPromptForRevisions.id,
            revision.title,
            revision.content,
            revision.category,
            revision.tags
          );
          if (!rolledBack) return;

          await fetchPrompts();
          onShowToast('Prompt rolled back to revision.');
          setSelectedPromptForRevisions(null);
        }}
        canRollback={canEditWorkspace}
      />

      <ListingManageModal
        open={!!uploadingPrompt}
        onClose={() => setUploadingPrompt(null)}
        initial={uploadingPrompt ? {
          title: uploadingPrompt.title,
          description: stripHtml(uploadingPrompt.content),
          item_type: 'prompt',
          item_id: uploadingPrompt.id,
          tags: Array.isArray(uploadingPrompt.tags) ? uploadingPrompt.tags.join(',') : (uploadingPrompt.tags || ''),
        } : {}}
        uploadFn={uploadFile}
        lockItemSelection
        onSave={async (payload) => {
          try {
            await createListing({ ...payload, currency: 'EUR', visibility: 'public' });
            setUploadingPrompt(null);
            onShowToast('Uploaded to marketplace!');
          } catch (error) {
            onShowToast(error?.message || 'Failed to upload to marketplace');
          }
        }}
      />
    </div>
  );
}
