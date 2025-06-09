import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import useDraft from '../hooks/useDraft';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorToolbar from './EditorToolbar';

export default function PromptForm({ onSave, initialData }) {
  const initialFormState = {
    title: '',
    content: '',
    tagsInput: '',
  };

  const [draft, setDraft, clearDraft] = useDraft('vault_draft_prompt', initialFormState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setup TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: draft.content,
    onUpdate: ({ editor }) => {
      setDraft({ ...draft, content: editor.getHTML() });
    },
  });

  // Sync initialData → for edit mode only
  useEffect(() => {
    if (initialData) {
      setDraft({
        title: initialData.title || '',
        content: initialData.content || '',
        tagsInput: Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : typeof initialData.tags === 'string'
          ? initialData.tags
          : '',
      });
      // Set TipTap content as well:
      if (editor) {
        editor.commands.setContent(initialData.content || '');
      }
      setError(null);
    } else {
      setError(null); // No setDraft(initialFormState) here! → let useDraft do its job
    }
  }, [initialData, setDraft, editor]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (draft.title.trim() === '' || draft.content.trim() === '') {
      setError('Title and Prompt Text are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const promptData = {
      id: initialData ? initialData.id : undefined,
      title: draft.title,
      content: draft.content,
      favorite: initialData ? initialData.favorite : false,
      tags: draft.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    try {
      await onSave(promptData);
      clearDraft(); // clear draft after save
    } catch (err) {
      console.error('Error saving prompt:', err);
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
        label="Prompt Title"
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        required
      />

      {/* TipTap editor → Prompt Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Prompt Text
        </label>
        <EditorToolbar editor={editor} />
        {/* Editor */}
 <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[150px] px-0">
  <EditorContent editor={editor} className="tiptap-editor" />
</div>


</div>

      <Input
        label="Tags (comma-separated)"
        value={draft.tagsInput}
        onChange={(e) => setDraft({ ...draft, tagsInput: e.target.value })}
        placeholder="e.g. Blog, AI, Content"
      />
      <Button type="submit" disabled={loading}>
        {loading
          ? initialData
            ? 'Updating Prompt...'
            : 'Saving Prompt...'
          : initialData
          ? 'Update Prompt'
          : 'Save Prompt'}
      </Button>
      </div>
    </form>
  );
}
