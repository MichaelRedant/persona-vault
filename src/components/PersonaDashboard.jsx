import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import ListingManageModal from './ListingManageModal';
import Modal from './Modal';
import PersonaCard from './PersonaCard';
import PersonaForm from './PersonaForm';
import RevisionsModal from './RevisionsModal';
import StatePanel from './StatePanel';
import { useMarketplaceApi } from '../hooks/useMarketplaceApi';
import { usePersonaRevisionsApi } from '../hooks/usePersonaRevisionsApi';

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
  defaultCollectionId = null,
  token,
  workspaceId,
  canEditWorkspace = true,
  workspaceTagSuggestions = [],
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedPersonaChanges, setHasUnsavedPersonaChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedPersonaForRevisions, setSelectedPersonaForRevisions] = useState(null);
  const [uploadingPersona, setUploadingPersona] = useState(null);
  const loadMoreRef = useRef();

  const { revisions, loading: loadingRevisions, fetchRevisions } = usePersonaRevisionsApi(
    token,
    workspaceId,
    onShowToast
  );
  const { createListing, uploadFile } = useMarketplaceApi(token);
  const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '');
  const parseCollectionIds = (value) => {
    if (Array.isArray(value)) {
      return value.map(Number).filter((entry) => Number.isFinite(entry) && entry > 0);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((entry) => Number.parseInt(entry.trim(), 10))
        .filter((entry) => Number.isFinite(entry) && entry > 0);
    }

    return [];
  };

  const openRevisionsModal = async (persona) => {
    await fetchRevisions(persona.id);
    setSelectedPersonaForRevisions(persona);
  };

  const filteredPersonas = personas
    .filter((item) =>
      (!showFavoritesOnly || item.favorite) &&
      (activeTags.length === 0 || (item.tags || []).some((tag) => activeTags.includes(tag))) &&
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

  useEffect(() => {
    if (editingPersona?.id) {
      fetchRevisions(editingPersona.id);
    }
  }, [editingPersona?.id, fetchRevisions]);

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

  const closePersonaModal = ({ discardDraft = false } = {}) => {
    setIsModalOpen(false);
    setEditingPersona(null);
    setIsEditing(false);
    setHasUnsavedPersonaChanges(false);
    setShowDiscardConfirm(false);
    if (discardDraft || isEditing) {
      localStorage.removeItem('vault_draft_persona');
    }
  };

  const requestClosePersonaModal = () => {
    if (hasUnsavedPersonaChanges) {
      setShowDiscardConfirm(true);
      return;
    }

    closePersonaModal();
  };

  const handleSavePersona = async (persona) => {
    if (!canEditWorkspace) {
      return;
    }

    const collectionId =
      editingPersona && editingPersona.collectionId !== undefined
        ? editingPersona.collectionId
        : defaultCollectionId;

    const collectionIds = persona.collectionIds || persona.collection_ids || [];
    const personaToSave = {
      ...persona,
      collectionId,
      collectionIds,
    };

    if (editingPersona) {
      const updated = await updatePersona(
        personaToSave.id,
        personaToSave.name,
        personaToSave.description,
        personaToSave.tags,
        personaToSave.collectionIds
      );
      if (!updated) return;
      onShowToast('Persona updated successfully!');
    } else {
      const created = await createPersona(
        personaToSave.name,
        personaToSave.description,
        personaToSave.tags,
        personaToSave.collectionIds
      );
      if (!created) return;
      onShowToast('Persona created successfully!');
    }

    await fetchPersonas();
    closePersonaModal({ discardDraft: true });
  };

  const startEdit = (persona) => {
    if (!canEditWorkspace) {
      return;
    }

    const enrichedPersona = {
      ...persona,
      collectionIds:
        Array.isArray(persona.collectionIds) ? persona.collectionIds :
        Array.isArray(persona.collection_ids) ? persona.collection_ids :
        (typeof persona.collection_id === 'number' ? [persona.collection_id] : []),
    };

    setEditingPersona(enrichedPersona);
    setIsEditing(true);
    setHasUnsavedPersonaChanges(false);
    setIsModalOpen(true);
  };

  const startCreate = () => {
    if (!canEditWorkspace) {
      return;
    }

    setEditingPersona(null);
    setIsEditing(false);
    setHasUnsavedPersonaChanges(false);
    setIsModalOpen(true);
  };

  const toggleFavorite = async (id, currentFavorite) => {
    if (!canEditWorkspace) {
      return;
    }

    const updated = await updatePersonaFavorite(id, currentFavorite ? 0 : 1);
    if (!updated) return;

    await fetchPersonas();
    onShowToast('Favorite updated!');
  };

  return (
    <div className="p-4 sm:p-6">
      {canEditWorkspace && (
        <div className="flex justify-end mb-6">
          <Button onClick={startCreate}>+ Add Persona</Button>
        </div>
      )}

      {filteredPersonas.length === 0 ? (
        <StatePanel
          variant="empty"
          title="No personas found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPersonas.slice(0, visibleCount).map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              collections={collections}
              onToggleFavorite={toggleFavorite}
              onDelete={async () => {
                if (!canEditWorkspace) return;
                const deleted = await deletePersona(persona.id);
                if (!deleted) return;

                await fetchPersonas();
                onShowToast('Persona deleted.');
              }}
              onEdit={startEdit}
              onShowToast={onShowToast}
              onViewRevisions={() => openRevisionsModal(persona)}
              onUpload={(p) => {
                if (!canEditWorkspace) return;
                setUploadingPersona(p);
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
        onClose={requestClosePersonaModal}
      >
        <PersonaForm
          key={editingPersona ? editingPersona.id : 'new'}
          onSave={handleSavePersona}
          initialData={
            editingPersona
              ? { ...editingPersona, collectionIds: editingPersona.collectionIds || [] }
              : {
                  collectionId: defaultCollectionId,
                  collectionIds: defaultCollectionId ? [defaultCollectionId] : [],
                }
          }
          collections={collections}
          workspaceTagSuggestions={workspaceTagSuggestions}
          onDirtyChange={setHasUnsavedPersonaChanges}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => closePersonaModal({ discardDraft: true })}
        title="Discard unsaved persona changes?"
        description="Your unsaved changes will be lost if you close this form."
      />

      <RevisionsModal
        isOpen={!!selectedPersonaForRevisions}
        onClose={() => setSelectedPersonaForRevisions(null)}
        revisions={revisions}
        loading={loadingRevisions}
        currentItem={selectedPersonaForRevisions}
        type="persona"
        onRollback={async (revision) => {
          if (!canEditWorkspace) return;
          const rolledBack = await updatePersona(
            selectedPersonaForRevisions.id,
            revision.name,
            revision.description,
            revision.tags,
            parseCollectionIds(revision.collection_ids)
          );
          if (!rolledBack) return;

          await fetchPersonas();
          onShowToast('Persona rolled back to revision.');
          setSelectedPersonaForRevisions(null);
        }}
        canRollback={canEditWorkspace}
      />

      <ListingManageModal
        open={!!uploadingPersona}
        onClose={() => setUploadingPersona(null)}
        initial={uploadingPersona ? {
          title: uploadingPersona.name,
          description: stripHtml(uploadingPersona.description),
          item_type: 'persona',
          item_id: uploadingPersona.id,
          tags: Array.isArray(uploadingPersona.tags) ? uploadingPersona.tags.join(',') : (uploadingPersona.tags || ''),
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
