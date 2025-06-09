import { useState, useEffect } from 'react';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import useDraft from '../hooks/useDraft';

export default function PromptForm({ onSave, initialData }) {
  const initialFormState = {
    title: '',
    content: '',
    tagsInput: '',
  };

  const [draft, setDraft, clearDraft] = useDraft('vault_draft_prompt', initialFormState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync initialData → for edit mode
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
      setError(null);
    } else {
      setError(null);
    }
  }, [initialData, setDraft]);

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

      <Input
        label="Prompt Title"
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        required
      />
      <Textarea
        label="Prompt Text"
        value={draft.content}
        onChange={(e) => setDraft({ ...draft, content: e.target.value })}
        required
      />
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
    </form>
  );
}
