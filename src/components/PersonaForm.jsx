import { useState, useEffect } from 'react';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';

export default function PersonaForm({ onSave, initialData }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');

      // ✅ robust tags handling
      const tagsArray = Array.isArray(initialData.tags)
        ? initialData.tags
        : typeof initialData.tags === 'string'
          ? initialData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [];

      setTagsInput(tagsArray.join(', '));

      setError(null);
    } else {
      setName('');
      setDescription('');
      setTagsInput('');
      setError(null);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === '' || description.trim() === '') {
      setError('Name and Description are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const personaData = {
      id: initialData ? initialData.id : undefined,
      name,
      description,
      favorite: initialData ? initialData.favorite : false,
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    try {
      await onSave(personaData);
    } catch (err) {
      console.error('Error saving persona:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }

    if (!initialData) {
      setName('');
      setDescription('');
      setTagsInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && (
        <div className="text-red-500 text-sm font-medium">{error}</div>
      )}

      <Input
        label="Persona Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Textarea
        label="Persona Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Input
        label="Tags (comma-separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
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
