import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import useDraft from '../hooks/useDraft';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorToolbar from './EditorToolbar';

export default function PersonaForm({ onSave, initialData }) {
  const initialFormState = {
    name: '',
    description: '',
    tagsInput: '',
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
      });
      if (editor) {
        editor.commands.setContent(initialData.description || '');
      }
      setError(null);
    } else {
      setError(null);
    }
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
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">

      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

      <div className="max-h-[70vh] overflow-y-auto px-1">

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

          <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[300px] max-h-[500px] overflow-y-auto">
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>
        </div>

        <Input
          label="Tags (comma-separated)"
          value={draft.tagsInput}
          onChange={(e) => setDraft({ ...draft, tagsInput: e.target.value })}
          placeholder="e.g. SEO, Content, Data"
        />
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
