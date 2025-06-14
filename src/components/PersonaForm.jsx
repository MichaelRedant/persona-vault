import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import useDraft from '../hooks/useDraft';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorToolbar from './EditorToolbar';

export default function PersonaForm({ onSave, initialData, collections = [] }) {
  const initialFormState = {
    name: '',
    description: '',
    tagsInput: '',
    collectionIds: [],
  };

  const [draft, setDraft, clearDraft] = useDraft('vault_draft_persona', initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: draft.description,
    onUpdate: ({ editor }) => {
      setDraft({ ...draft, description: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        placeholder: 'Beschrijf deze persona hier...',
        class: 'min-h-[300px] max-h-[500px] overflow-y-auto prose dark:prose-invert prose-sm px-3 py-2 focus:outline-none'
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      setDraft({
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
      });

      if (editor) {
        editor.commands.setContent(initialData.description || '');
      }
    } else {
      setDraft(initialFormState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, setDraft, editor]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (draft.name.trim() === '' || draft.description.trim() === '') {
      setError('Name and Description are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const personaData = {
      id: initialData ? initialData.id : undefined,
      name: draft.name,
      description: draft.description,
      favorite: initialData ? initialData.favorite : false,
      tags: draft.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter((tag, i, arr) => tag && arr.indexOf(tag) === i), // unieke tags
      collectionIds: draft.collectionIds,
    };

    try {
      await onSave(personaData);
      clearDraft();
    } catch (err) {
      console.error('Error saving persona:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (id) => {
    setDraft((prev) => {
      const updated = prev.collectionIds.includes(id)
        ? prev.collectionIds.filter((cid) => cid !== id)
        : [...prev.collectionIds, id];
      return { ...prev, collectionIds: updated };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

      <div className="max-h-[70vh] overflow-y-auto px-1 space-y-4">
        <Input
          label="Persona Name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Persona Description
          </label>
          <EditorToolbar editor={editor} />
          <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <EditorContent editor={editor} />
          </div>
        </div>

        <Input
          label="Tags (comma-separated)"
          value={draft.tagsInput}
          onChange={(e) => setDraft({ ...draft, tagsInput: e.target.value })}
          placeholder="e.g. SEO, Content, Data"
        />

        {/* 🧩 Collection Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Collections
          </label>

          {collections.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No collections available.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Geselecteerd: {draft.collectionIds.length}
              </p>

              <div className="border rounded-md p-2 max-h-60 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {collections.map((c) => {
                  const isSelected = draft.collectionIds.includes(Number(c.id));
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCollection(Number(c.id))}
                      title={c.name}
                      className={`px-3 py-2 rounded-md border text-sm font-medium text-left truncate
                        ${isSelected
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600'}
                      `}
                    >
                      {c.name}
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
