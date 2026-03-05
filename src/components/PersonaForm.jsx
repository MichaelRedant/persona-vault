import { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Button from './Button';
import EditorToolbar from './EditorToolbar';
import Input from './Input';
import useDraft from '../hooks/useDraft';
import { htmlToPlainText } from '../utils/sanitizeHtml';
import {
  mergeUniqueTags,
  suggestStructureBlocks,
  suggestTagsFromContent,
} from '../utils/workflowSuggestions';

const DEFAULT_PERSONA_FORM_STATE = {
  name: '',
  description: '',
  tagsInput: '',
  collectionIds: [],
};

const normalizeCollectionIds = (ids = []) =>
  [...new Set((Array.isArray(ids) ? ids : [])
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry) && entry > 0))]
    .sort((a, b) => a - b);

const buildComparableState = (state) => ({
  name: String(state?.name || '').trim(),
  description: String(state?.description || '').trim(),
  tags: mergeUniqueTags(state?.tagsInput || '').join(','),
  collectionIds: normalizeCollectionIds(state?.collectionIds).join(','),
});

export default function PersonaForm({
  onSave,
  initialData,
  collections = [],
  workspaceTagSuggestions = [],
  onDirtyChange,
}) {
  const [draft, setDraft, clearDraft] = useDraft('vault_draft_persona', DEFAULT_PERSONA_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: draft.description,
    onUpdate: ({ editor: activeEditor }) => {
      setDraft((previous) => ({ ...previous, description: activeEditor.getHTML() }));
    },
    editorProps: {
      attributes: {
        id: 'persona-description-editor',
        'aria-label': 'Persona description',
        placeholder: 'Describe this persona...',
        class: 'min-h-[300px] max-h-[500px] overflow-y-auto prose dark:prose-invert prose-sm px-3 py-2 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      const nextDraft = {
        name: initialData.name || '',
        description: initialData.description || '',
        tagsInput: Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : typeof initialData.tags === 'string'
            ? initialData.tags
            : '',
        collectionIds: Array.isArray(initialData.collectionIds)
          ? initialData.collectionIds
          : [],
      };

      setDraft(nextDraft);
      if (editor) {
        editor.commands.setContent(nextDraft.description || '');
      }
      return;
    }

    setDraft(DEFAULT_PERSONA_FORM_STATE);
    if (editor) {
      editor.commands.setContent('');
    }
  }, [initialData, setDraft, editor]);

  const currentTags = useMemo(() => mergeUniqueTags(draft.tagsInput), [draft.tagsInput]);
  const baselineComparable = useMemo(() => {
    const baselineState = initialData ? {
      name: initialData.name || '',
      description: initialData.description || '',
      tagsInput: Array.isArray(initialData.tags)
        ? initialData.tags.join(', ')
        : typeof initialData.tags === 'string'
          ? initialData.tags
          : '',
      collectionIds: Array.isArray(initialData.collectionIds) ? initialData.collectionIds : [],
    } : DEFAULT_PERSONA_FORM_STATE;

    return buildComparableState(baselineState);
  }, [initialData]);

  const draftComparable = useMemo(() => buildComparableState(draft), [draft]);

  const isDirty = useMemo(
    () => JSON.stringify(draftComparable) !== JSON.stringify(baselineComparable),
    [draftComparable, baselineComparable]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const suggestedTags = useMemo(
    () =>
      suggestTagsFromContent({
        title: draft.name,
        body: htmlToPlainText(draft.description),
        workspaceTags: workspaceTagSuggestions,
        currentTags,
        max: 6,
      }),
    [draft.name, draft.description, workspaceTagSuggestions, currentTags]
  );

  const structureSuggestions = useMemo(
    () =>
      suggestStructureBlocks({
        type: 'persona',
        title: draft.name,
        body: htmlToPlainText(draft.description),
      }),
    [draft.name, draft.description]
  );

  const applyTagSuggestion = (tag) => {
    setDraft((previous) => ({
      ...previous,
      tagsInput: mergeUniqueTags(previous.tagsInput, [tag]).join(', '),
    }));
  };

  const insertStructureTemplate = (htmlTemplate) => {
    if (!htmlTemplate) {
      return;
    }

    const existingHtml = editor?.getHTML?.() || draft.description || '';
    const hasContent = htmlToPlainText(existingHtml).trim().length > 0;
    const nextHtml = hasContent ? `${existingHtml}<p></p>${htmlTemplate}` : htmlTemplate;

    if (editor) {
      editor.commands.setContent(nextHtml);
    }
    setDraft((previous) => ({ ...previous, description: nextHtml }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const plainDescription = htmlToPlainText(draft.description).trim();
    if (draft.name.trim() === '' || plainDescription === '') {
      setError('Name and description are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const personaData = {
      id: initialData ? initialData.id : undefined,
      name: draft.name,
      description: draft.description,
      favorite: initialData ? initialData.favorite : false,
      tags: mergeUniqueTags(draft.tagsInput),
      collectionIds: Array.isArray(draft.collectionIds) ? draft.collectionIds : [],
    };

    try {
      await onSave(personaData);
      onDirtyChange?.(false);
      clearDraft();
    } catch {
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (collectionId) => {
    setDraft((previous) => {
      const updated = previous.collectionIds.includes(collectionId)
        ? previous.collectionIds.filter((entry) => entry !== collectionId)
        : [...previous.collectionIds, collectionId];
      return { ...previous, collectionIds: updated };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

      <div className="max-h-[70vh] overflow-y-auto px-1 space-y-4">
        <Input
          label="Persona Name"
          value={draft.name}
          onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
          required
        />

        <div>
          <label htmlFor="persona-description-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Persona Description
          </label>
          <EditorToolbar editor={editor} />
          <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="space-y-2">
          <Input
            label="Tags (comma-separated)"
            value={draft.tagsInput}
            onChange={(event) => setDraft((previous) => ({ ...previous, tagsInput: event.target.value }))}
            placeholder="e.g. SEO, Content, Data"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Smart tag suggestions
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestedTags.length > 0 ? (
                suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => applyTagSuggestion(tag)}
                    className="pv-chip hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    + {tag}
                  </button>
                ))
              ) : (
                <p className="text-xs pv-subtle">No suggestions yet. Add more context to generate recommendations.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Suggested structure blocks
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {structureSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => insertStructureTemplate(suggestion.html)}
                  className="px-2.5 py-1 text-xs rounded-full border border-[var(--pv-border)] bg-[var(--pv-surface-muted)] hover:bg-[var(--pv-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Insert {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p id="persona-collections-label" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Collections
          </p>

          {collections.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No collections available.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Selected: {draft.collectionIds.length}
              </p>

              <div
                role="group"
                aria-labelledby="persona-collections-label"
                className="border rounded-md p-2 max-h-60 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
              >
                {collections.map((collection) => {
                  const isSelected = draft.collectionIds.includes(Number(collection.id));
                  return (
                    <button
                      type="button"
                      key={collection.id}
                      onClick={() => toggleCollection(Number(collection.id))}
                      title={collection.name}
                      className={`px-3 py-2 rounded-md border text-sm font-medium text-left truncate ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {collection.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? initialData
            ? 'Updating Persona...'
            : 'Saving Persona...'
          : initialData
            ? 'Update Persona'
            : 'Save Persona'}
      </Button>
    </form>
  );
}
