import { useState, useEffect } from 'react';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';

export default function PromptForm({ onSave, initialData }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');

      // ✅ robust tags handling
      const tagsArray = Array.isArray(initialData.tags)
        ? initialData.tags
        : typeof initialData.tags === 'string'
          ? initialData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [];

      setTagsInput(tagsArray.join(', '));

      setError(null);
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
      setError(null);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim() === '' || content.trim() === '') {
      setError('Title and Prompt Text are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const promptData = {
      id: initialData ? initialData.id : undefined,
      title,
      content,
      favorite: initialData ? initialData.favorite : false,
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    try {
      await onSave(promptData);
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }

    if (!initialData) {
      setTitle('');
      setContent('');
      setTagsInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && (
        <div className="text-red-500 text-sm font-medium">{error}</div>
      )}

      <Input
        label="Prompt Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        label="Prompt Text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <Input
        label="Tags (comma-separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
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
