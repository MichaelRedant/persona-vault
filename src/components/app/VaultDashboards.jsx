import { lazy, Suspense, useMemo, useState } from 'react';
import { FiLayers } from 'react-icons/fi';
import CollectionTabs from './DesktopTabs';
import ConfirmDialog from '../ConfirmDialog';
import FavoritesFilter from '../FavoritesFilter';
import QuickTitlesDropdown from '../QuickTitlesDropdown.jsx';
import SortDropdown from '../SortDropdown';
import StatePanel from '../StatePanel';
import TagFilterDropdown from '../TagFilterDropdown';
import { buildWorkspaceTagPool } from '../../utils/workflowSuggestions';

const CollectionDashboard = lazy(() => import('../../pages/CollectionDashboard'));
const CollectionPage = lazy(() => import('../../pages/CollectionPage'));
const PersonaDashboard = lazy(() => import('../PersonaDashboard'));
const PromptDashboard = lazy(() => import('../PromptDashboard'));
const WorkflowPacksModal = lazy(() => import('../WorkflowPacksModal'));

function SectionFallback({ message }) {
  return (
    <StatePanel
      variant="loading"
      title={message}
      description="Please wait..."
      className="mb-4"
    />
  );
}

function VaultDashboards({
  selectedTab,
  setSelectedTab,
  showFavoritesOnly,
  setShowFavoritesOnly,
  personas,
  prompts,
  activeTags,
  onToggleTag,
  onShowToast,
  loadingPersonas,
  errorPersonas,
  loadingPrompts,
  errorPrompts,
  collections,
  collectionsWithCounts,
  loadingCollections,
  errorCollections,
  personaSortOption,
  setPersonaSortOption,
  promptSortOption,
  setPromptSortOption,
  collectionSortOption,
  setCollectionSortOption,
  setPersonas,
  setPrompts,
  setCollections,
  fetchPersonas,
  fetchPrompts,
  createPersona,
  updatePersona,
  deletePersona,
  updatePersonaFavorite,
  removePersonaFromCollection,
  createPrompt,
  updatePrompt,
  deletePrompt,
  updatePromptFavorite,
  searchTerm,
  defaultCollectionIdForNewPersona,
  editingPersona,
  isPersonaModalOpen,
  setIsPersonaModalOpen,
  setEditingPersona,
  token,
  activeWorkspaceId,
  compactMode,
  activeCollectionId,
  setActiveCollectionId,
  setDefaultCollectionIdForNewPersona,
  createCollection,
  renameCollection,
  deleteCollection,
  canEditWorkspace = true,
}) {
  const [pendingDeletePersonaId, setPendingDeletePersonaId] = useState(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const workspaceTagSuggestions = useMemo(
    () => buildWorkspaceTagPool(personas, prompts, 12),
    [personas, prompts]
  );

  const handleConfirmPersonaDelete = async () => {
    if (!pendingDeletePersonaId) {
      return;
    }

    const deleted = await deletePersona(pendingDeletePersonaId);
    if (!deleted) {
      return;
    }

    await fetchPersonas();
    onShowToast('Persona deleted.');
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-4 mt-6">
        <FavoritesFilter
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={setShowFavoritesOnly}
          favoritesList={selectedTab === 'personas' ? personas : prompts}
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-4 flex flex-wrap gap-2 items-center justify-center">
        <TagFilterDropdown
          tags={[...personas.map((persona) => persona.tags || []), ...prompts.map((prompt) => prompt.tags || [])]}
          activeTags={activeTags}
          onTagToggle={onToggleTag}
        />
        <QuickTitlesDropdown
          personaItems={personas.map((persona) => ({ title: persona.name, content: persona.description }))}
          promptItems={prompts.map((prompt) => ({ title: prompt.title, content: prompt.content }))}
          onShowToast={onShowToast}
        />
        <button
          type="button"
          onClick={() => setIsWorkflowModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Open workflow packs"
        >
          <FiLayers aria-hidden="true" />
          Workflow Packs
        </button>
      </div>

      {!canEditWorkspace && (
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-4">
          <StatePanel
            variant="empty"
            title="Read-only workspace access"
            description="Your role is viewer in this workspace. Create/edit/delete actions are disabled."
          />
        </div>
      )}

      <CollectionTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} />

      {selectedTab === 'collectionDetail' && !activeCollectionId ? (
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-16">
          <StatePanel
            variant="empty"
            title="No collection selected"
            description="Select a collection first to view its personas."
            actionLabel="Back to collections"
            onAction={() => setSelectedTab('collections')}
          />
        </div>
      ) : selectedTab === 'collectionDetail' && loadingPersonas ? (
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-16">
          <StatePanel
            variant="loading"
            title="Loading collection personas..."
            description="Fetching personas for this collection."
          />
        </div>
      ) : selectedTab === 'collectionDetail' && !loadingPersonas ? (
        <Suspense fallback={<SectionFallback message="Loading collection..." />}>
          <CollectionPage
            collectionId={activeCollectionId}
            personas={personas}
            collections={collections}
            loadingPersonas={loadingPersonas}
            onBack={() => setSelectedTab('collections')}
            canEditWorkspace={canEditWorkspace}
            onAddPersonaToCollection={(collectionId) => {
              if (!canEditWorkspace) return;
              setSelectedTab('personas');
              setDefaultCollectionIdForNewPersona(collectionId);
            }}
            onAssignPersonasToCollection={async (personaIds, collectionId) => {
              if (!canEditWorkspace) return;
              for (const id of personaIds) {
                const persona = personas.find((entry) => entry.id === id);
                if (persona) {
                  await updatePersona(
                    id,
                    persona.name,
                    persona.description,
                    persona.tags,
                    [...(persona.collection_ids || []), collectionId]
                  );
                }
              }
              await fetchPersonas();
              onShowToast('Personas assigned to collection!');
            }}
            onRemovePersonaFromCollection={async (personaId, collectionId) => {
              if (!canEditWorkspace) return;
              try {
                await removePersonaFromCollection(personaId, collectionId);
                await fetchPersonas();
                onShowToast('Persona removed from collection!');
              } catch {
                onShowToast('Error removing from collection');
              }
            }}
            onShowToast={onShowToast}
            onToggleFavorite={async (personaId, favorite) => {
              if (!canEditWorkspace) return;
              const updated = await updatePersonaFavorite(personaId, favorite ? 0 : 1);
              if (!updated) return;

              await fetchPersonas();
              onShowToast('Favorite updated!');
            }}
            onDeletePersona={async (personaId) => {
              if (!canEditWorkspace) return;
              setPendingDeletePersonaId(personaId);
            }}
            onStartEditPersona={(persona) => {
              if (!canEditWorkspace) return;
              const fullPersona = personas.find((entry) => entry.id === persona.id);
              if (!fullPersona) {
                onShowToast('Persona data not found');
                return;
              }

              setEditingPersona(fullPersona);
              setIsPersonaModalOpen(true);
              onShowToast(`Editing persona "${fullPersona.name}"...`);
            }}
            token={token}
          />
        </Suspense>
      ) : (
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 mb-16">
          <div className={selectedTab === 'personas' ? 'block' : 'hidden'}>
            <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mb-2 flex items-center space-x-2">
                <span>Persona Dashboard</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">({personas.length})</span>
              </h2>

              <SortDropdown sortOption={personaSortOption} onSortChange={setPersonaSortOption} />
            </div>

            {loadingPersonas && (
              <StatePanel
                variant="loading"
                title="Loading personas..."
                description="Refreshing persona list."
                className="mb-4"
              />
            )}
            {errorPersonas && !loadingPersonas && (
              <StatePanel
                variant="error"
                title="Could not load personas"
                description={errorPersonas?.message || 'Please try again.'}
                className="mb-4"
              />
            )}

            <Suspense fallback={<SectionFallback message="Loading persona dashboard..." />}>
              <PersonaDashboard
                personas={personas}
                setPersonas={setPersonas}
                fetchPersonas={fetchPersonas}
                createPersona={createPersona}
                updatePersona={updatePersona}
                deletePersona={deletePersona}
                updatePersonaFavorite={updatePersonaFavorite}
                searchTerm={searchTerm}
                activeTags={activeTags}
                showFavoritesOnly={showFavoritesOnly}
                sortOption={personaSortOption}
                onShowToast={onShowToast}
                onSortChange={setPersonaSortOption}
                compactMode={compactMode}
                defaultCollectionId={defaultCollectionIdForNewPersona}
                collections={collections}
                editingPersona={editingPersona}
                isModalOpen={isPersonaModalOpen}
                setIsModalOpen={setIsPersonaModalOpen}
                setEditingPersona={setEditingPersona}
                token={token}
                workspaceId={activeWorkspaceId}
                canEditWorkspace={canEditWorkspace}
                workspaceTagSuggestions={workspaceTagSuggestions}
              />
            </Suspense>
          </div>

          <div className={selectedTab === 'prompts' ? 'block' : 'hidden'}>
            <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mb-2 flex items-center space-x-2">
                <span>Prompt Dashboard</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">({prompts.length})</span>
              </h2>

              <SortDropdown sortOption={promptSortOption} onSortChange={setPromptSortOption} />
            </div>

            {loadingPrompts && (
              <StatePanel
                variant="loading"
                title="Loading prompts..."
                description="Refreshing prompt list."
                className="mb-4"
              />
            )}
            {errorPrompts && !loadingPrompts && (
              <StatePanel
                variant="error"
                title="Could not load prompts"
                description={errorPrompts?.message || 'Please try again.'}
                className="mb-4"
              />
            )}

            <Suspense fallback={<SectionFallback message="Loading prompt dashboard..." />}>
              <PromptDashboard
                prompts={prompts}
                setPrompts={setPrompts}
                fetchPrompts={fetchPrompts}
                createPrompt={createPrompt}
                updatePrompt={updatePrompt}
                deletePrompt={deletePrompt}
                updatePromptFavorite={updatePromptFavorite}
                searchTerm={searchTerm}
                onShowToast={onShowToast}
                activeTags={activeTags}
                showFavoritesOnly={showFavoritesOnly}
                sortOption={promptSortOption}
                setSortOption={setPromptSortOption}
                compactMode={compactMode}
                workspaceId={activeWorkspaceId}
                canEditWorkspace={canEditWorkspace}
                workspaceTagSuggestions={workspaceTagSuggestions}
              />
            </Suspense>
          </div>

          <div className={selectedTab === 'collections' ? 'block' : 'hidden'}>
            <Suspense fallback={<SectionFallback message="Loading collection dashboard..." />}>
              <CollectionDashboard
                collections={collectionsWithCounts}
                setCollections={setCollections}
                loading={loadingCollections}
                error={errorCollections}
                canEditWorkspace={canEditWorkspace}
                sortOption={collectionSortOption}
                onSortChange={setCollectionSortOption}
                onOpenCollection={(collectionId) => {
                  setActiveCollectionId(collectionId);
                  setSelectedTab('collectionDetail');
                }}
                onAddCollection={async (name) => {
                  if (!canEditWorkspace) return false;
                  const created = await createCollection(name);
                  if (!created) return false;
                  onShowToast('Collectie aangemaakt!');
                  return true;
                }}
                onRenameCollection={async (id, newName) => {
                  if (!canEditWorkspace) return;
                  const updated = collections.map((collection) =>
                    collection.id === id ? { ...collection, name: newName } : collection
                  );
                  setCollections(updated);
                  const success = await renameCollection(id, newName);
                  if (success) {
                    onShowToast(`Collectie hernoemd naar "${newName}"`);
                  } else {
                    onShowToast('Error renaming collection');
                  }
                }}
                onDeleteCollection={async (id) => {
                  if (!canEditWorkspace) return;
                  const deleted = await deleteCollection(id);
                  if (!deleted) return;
                  onShowToast('Collectie verwijderd!');
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeletePersonaId)}
        onClose={() => setPendingDeletePersonaId(null)}
        onConfirm={handleConfirmPersonaDelete}
        title="Delete Persona"
        description="Are you sure you want to delete this persona? This action cannot be undone."
      />

      <Suspense fallback={null}>
        <WorkflowPacksModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
          collections={collections}
          personas={personas}
          prompts={prompts}
          createPersona={createPersona}
          createPrompt={createPrompt}
          fetchPersonas={fetchPersonas}
          fetchPrompts={fetchPrompts}
          onShowToast={onShowToast}
          canEditWorkspace={canEditWorkspace}
        />
      </Suspense>
    </>
  );
}

export default VaultDashboards;
