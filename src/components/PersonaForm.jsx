import { useState, useEffect } from 'react';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import useDraft from '../hooks/useDraft';

export default function PersonaForm({ onSave, initialData }) {
  const initialFormState = {
    name: '',
    description: '',
    tagsInput: '',
  };

  const [draft, setDraft, clearDraft] = useDraft('vault_draft_persona', initialFormState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync initialData → for edit mode only
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
      setError(null);
    } else {
      setError(null); // No setDraft(initialFormState) here! → let useDraft do its job
    }
  }, [initialData, setDraft]);

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
      clearDraft(); // clear draft after save
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

      <Input
        label="Persona Name"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        required
      />
      <Textarea
        label="Persona Description"
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        required
      />
      <Input
        label="Tags (comma-separated)"
        value={draft.tagsInput}
        onChange={(e) => setDraft({ ...draft, tagsInput: e.target.value })}
        placeholder="e.g. SEO, Content, Data"
      />
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
