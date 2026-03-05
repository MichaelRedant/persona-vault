import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiLayers, FiPlay, FiTag } from 'react-icons/fi';
import Button from './Button';
import Modal from './Modal';
import StatePanel from './StatePanel';
import { WORKFLOW_PACKS } from '../data/workflowPacks';
import {
  buildWorkspaceTagPool,
  mergeUniqueTags,
  suggestTagsFromContent,
} from '../utils/workflowSuggestions';

export default function WorkflowPacksModal({
  isOpen,
  onClose,
  collections = [],
  personas = [],
  prompts = [],
  createPersona,
  createPrompt,
  fetchPersonas,
  fetchPrompts,
  onShowToast,
  canEditWorkspace = true,
}) {
  const [selectedPackId, setSelectedPackId] = useState(() => WORKFLOW_PACKS[0]?.id || '');
  const [targetCollectionId, setTargetCollectionId] = useState('');
  const [includePersonas, setIncludePersonas] = useState(true);
  const [includePrompts, setIncludePrompts] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const selectedPack = useMemo(
    () => WORKFLOW_PACKS.find((pack) => pack.id === selectedPackId) || null,
    [selectedPackId]
  );

  const workspaceTagPool = useMemo(
    () => buildWorkspaceTagPool(personas, prompts, 10),
    [personas, prompts]
  );

  const smartPackTags = useMemo(() => {
    if (!selectedPack) {
      return [];
    }

    return suggestTagsFromContent({
      title: selectedPack.title,
      body: `${selectedPack.description} ${selectedPack.structureSteps.join(' ')}`,
      workspaceTags: workspaceTagPool,
      seedTags: selectedPack.tags,
      max: 8,
    });
  }, [selectedPack, workspaceTagPool]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    localStorage.setItem('vault_onboard_exploredTemplates', '1');
    if (!selectedPackId && WORKFLOW_PACKS.length > 0) {
      setSelectedPackId(WORKFLOW_PACKS[0].id);
    }

    if (!targetCollectionId && collections.length > 0) {
      setTargetCollectionId(String(collections[0].id));
    }
  }, [isOpen, selectedPackId, targetCollectionId, collections]);

  const resetImportOptions = () => {
    setIncludePersonas(true);
    setIncludePrompts(true);
  };

  const handleImportPack = async () => {
    if (!canEditWorkspace) {
      onShowToast?.('Viewer role cannot import workflow packs in this workspace.');
      return;
    }

    if (!selectedPack) {
      onShowToast?.('Select a workflow pack first.');
      return;
    }

    if (!includePersonas && !includePrompts) {
      onShowToast?.('Select at least personas or prompts to import.');
      return;
    }

    const targetCollectionIds = targetCollectionId ? [Number(targetCollectionId)] : [];
    const personaTemplates = includePersonas ? selectedPack.personas : [];
    const promptTemplates = includePrompts ? selectedPack.prompts : [];

    let importedPersonas = 0;
    let importedPrompts = 0;

    setIsImporting(true);

    try {
      for (const personaTemplate of personaTemplates) {
        const tags = mergeUniqueTags(personaTemplate.tags, selectedPack.tags, smartPackTags).slice(0, 8);
        const created = await createPersona(
          personaTemplate.name,
          personaTemplate.description,
          tags,
          targetCollectionIds
        );
        if (created) {
          importedPersonas += 1;
        }
      }

      for (const promptTemplate of promptTemplates) {
        const tags = mergeUniqueTags(promptTemplate.tags, selectedPack.tags, smartPackTags).slice(0, 8);
        const created = await createPrompt(
          promptTemplate.title,
          promptTemplate.content,
          promptTemplate.category || '',
          tags
        );
        if (created) {
          importedPrompts += 1;
        }
      }

      await Promise.all([fetchPersonas?.(), fetchPrompts?.()]);

      const expectedPersonas = personaTemplates.length;
      const expectedPrompts = promptTemplates.length;

      const successMessage = `Workflow pack imported: ${importedPersonas}/${expectedPersonas} personas, ${importedPrompts}/${expectedPrompts} prompts.`;
      onShowToast?.(successMessage);

      if (importedPersonas === expectedPersonas && importedPrompts === expectedPrompts) {
        resetImportOptions();
        onClose?.();
      }
    } catch {
      onShowToast?.('Failed to import workflow pack.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (isImporting) {
          return;
        }
        resetImportOptions();
        onClose?.();
      }}
      size="2xl"
      ariaLabel="Workflow packs"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiLayers aria-hidden="true" />
              Workflow Packs
            </h3>
            <p className="text-sm pv-subtle mt-1">
              Import curated personas and prompts into your current workspace.
            </p>
          </div>
          <span className="text-xs pv-subtle">{WORKFLOW_PACKS.length} packs</span>
        </div>

        {!canEditWorkspace && (
          <StatePanel
            variant="empty"
            title="Read-only access"
            description="Your role is viewer in this workspace. Import actions are disabled."
          />
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr,1.3fr]">
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {WORKFLOW_PACKS.map((pack) => {
              const selected = pack.id === selectedPackId;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`w-full text-left rounded-lg border p-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    selected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{pack.title}</p>
                    {selected && <FiCheckCircle className="text-blue-600" aria-hidden="true" />}
                  </div>
                  <p className="text-xs pv-subtle mt-1">{pack.subtitle}</p>
                  <p className="text-xs pv-subtle mt-2">
                    {pack.personas.length} personas / {pack.prompts.length} prompts
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-900/30 space-y-4">
            {!selectedPack ? (
              <StatePanel
                variant="empty"
                title="No pack selected"
                description="Select a workflow pack to preview its contents."
              />
            ) : (
              <>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{selectedPack.title}</h4>
                  <p className="text-sm pv-subtle mt-1">{selectedPack.description}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Suggested workflow structure
                  </p>
                  <ol className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200 list-decimal pl-5">
                    {selectedPack.structureSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FiTag aria-hidden="true" /> Smart tag suggestions
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {smartPackTags.map((tag) => (
                      <span key={tag} className="pv-chip">
                        {tag}
                      </span>
                    ))}
                    {smartPackTags.length === 0 && (
                      <span className="text-xs pv-subtle">No suggestions yet.</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={includePersonas}
                      onChange={(event) => setIncludePersonas(event.target.checked)}
                      disabled={!canEditWorkspace || isImporting}
                    />
                    Import personas ({selectedPack.personas.length})
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={includePrompts}
                      onChange={(event) => setIncludePrompts(event.target.checked)}
                      disabled={!canEditWorkspace || isImporting}
                    />
                    Import prompts ({selectedPack.prompts.length})
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="workflow-pack-collection"
                    className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Quick import collection
                  </label>
                  <select
                    id="workflow-pack-collection"
                    value={targetCollectionId}
                    onChange={(event) => setTargetCollectionId(event.target.value)}
                    disabled={!canEditWorkspace || isImporting}
                    className="mt-1 pv-input text-sm"
                  >
                    <option value="">No collection assignment</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs pv-subtle mt-1">
                    Personas will be linked to the selected collection during import.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="secondary"
            onClick={() => {
              if (isImporting) {
                return;
              }
              resetImportOptions();
              onClose?.();
            }}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportPack}
            disabled={!canEditWorkspace || isImporting || !selectedPack}
            icon={<FiPlay aria-hidden="true" />}
          >
            {isImporting ? 'Importing...' : 'Import Workflow Pack'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
