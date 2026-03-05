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

const DEFAULT_PROMPT_FORM_STATE = {
  title: '',
  content: '',
  tagsInput: '',
};

const buildComparableState = (state) => ({
  title: String(state?.title || '').trim(),
  content: String(state?.content || '').trim(),
  tags: mergeUniqueTags(state?.tagsInput || '').join(','),
});

export default function PromptForm({ onSave, initialData, workspaceTagSuggestions = [], onDirtyChange }) {
  const [draft, setDraft, clearDraft] = useDraft('vault_draft_prompt', DEFAULT_PROMPT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: draft.content,
    onUpdate: ({ editor: activeEditor }) => {
      setDraft((previous) => ({ ...previous, content: activeEditor.getHTML() }));
    },
    editorProps: {
      attributes: {
        id: 'prompt-content-editor',
        'aria-label': 'Prompt text',
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      const nextDraft = {
        title: initialData.title || '',
        content: initialData.content || '',
        tagsInput: Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : typeof initialData.tags === 'string'
            ? initialData.tags
            : '',
      };

      setDraft(nextDraft);
      if (editor) {
        editor.commands.setContent(nextDraft.content || '');
      }
      setError(null);
      return;
    }

    setError(null);
  }, [initialData, setDraft, editor]);

  const currentTags = useMemo(() => mergeUniqueTags(draft.tagsInput), [draft.tagsInput]);
  const baselineComparable = useMemo(() => {
    const baselineState = initialData ? {
      title: initialData.title || '',
      content: initialData.content || '',
      tagsInput: Array.isArray(initialData.tags)
        ? initialData.tags.join(', ')
        : typeof initialData.tags === 'string'
          ? initialData.tags
          : '',
    } : DEFAULT_PROMPT_FORM_STATE;

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
        title: draft.title,
        body: htmlToPlainText(draft.content),
        workspaceTags: workspaceTagSuggestions,
        currentTags,
        max: 6,
      }),
    [draft.title, draft.content, workspaceTagSuggestions, currentTags]
  );

  const structureSuggestions = useMemo(
    () =>
      suggestStructureBlocks({
        type: 'prompt',
        title: draft.title,
        body: htmlToPlainText(draft.content),
      }),
    [draft.title, draft.content]
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

    const existingHtml = editor?.getHTML?.() || draft.content || '';
    const hasContent = htmlToPlainText(existingHtml).trim().length > 0;
    const nextHtml = hasContent ? `${existingHtml}<p></p>${htmlTemplate}` : htmlTemplate;

    if (editor) {
      editor.commands.setContent(nextHtml);
    }
    setDraft((previous) => ({ ...previous, content: nextHtml }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const plainContent = htmlToPlainText(draft.content).trim();
    if (draft.title.trim() === '' || plainContent === '') {
      setError('Title and prompt text are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const promptData = {
      id: initialData ? initialData.id : undefined,
      title: draft.title,
      content: draft.content,
      category: initialData?.category || '',
      favorite: initialData ? initialData.favorite : false,
      tags: mergeUniqueTags(draft.tagsInput),
    };

    try {
      await onSave(promptData);
      onDirtyChange?.(false);
      clearDraft();
    } catch {
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

      <div className="max-h-[70vh] overflow-y-auto px-1 space-y-4">
        <Input
          label="Prompt Title"
          value={draft.title}
          onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
          required
        />

        <div>
          <label htmlFor="prompt-content-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Prompt Text
          </label>
          <EditorToolbar editor={editor} />
          <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[150px] px-0">
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>
        </div>

        <div className="space-y-2">
          <Input
            label="Tags (comma-separated)"
            value={draft.tagsInput}
            onChange={(event) => setDraft((previous) => ({ ...previous, tagsInput: event.target.value }))}
            placeholder="e.g. Blog, AI, Content"
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
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? initialData
            ? 'Updating Prompt...'
            : 'Saving Prompt...'
          : initialData
            ? 'Update Prompt'
            : 'Save Prompt'}
      </Button>
    </form>
  );
}
