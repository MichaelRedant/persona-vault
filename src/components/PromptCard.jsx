import { useState } from 'react';
import { downloadAsJson } from '../utils/downloadAsJson';
import TryInPlatformButtons from './TryInPlatformButtons';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FiEdit2, FiTrash2, FiDownload, FiCopy } from 'react-icons/fi';

export default function PromptCard({ prompt, onToggleFavorite, onDelete, onEdit, onShowToast }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopy = (text) => {
    const safeText = text || '';
    navigator.clipboard.writeText(safeText)
      .then(() => {
        onShowToast('Prompt copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy!', err);
        onShowToast('Failed to copy prompt.');
      });
  };

  // ✅ Robust tags parsing
  const tagsArray = Array.isArray(prompt.tags)
    ? prompt.tags
    : typeof prompt.tags === 'string'
      ? prompt.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  return (
    <div className="bg-gradient-to-tr from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6 transition-transform transform hover:scale-[1.02] hover:shadow-xl duration-200 ease-in-out animate-fadeIn">

      <div className="flex justify-between items-start flex-wrap sm:flex-nowrap">
        {/* Content */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{prompt.title}</h2>
          <p className="text-sm text-gray-500 mb-2">{prompt.content}</p>
          <div className="flex flex-wrap gap-2">
            {tagsArray.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-end sm:justify-start mt-4 sm:mt-0">
          <Button
            onClick={() => onToggleFavorite(prompt.id, prompt.favorite)}
            variant="success"
            icon={prompt.favorite ? <AiFillStar /> : <AiOutlineStar />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Favorite"
          />
          <Button
            onClick={() => handleCopy(prompt.content)}
            variant="secondary"
            icon={<FiCopy className="w-5 h-5" />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Copy to Clipboard"
          />
          <Button
            onClick={() => onEdit(prompt)}
            variant="primary"
            icon={<FiEdit2 className="w-5 h-5" />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Edit"
          />
          <Button
            onClick={() => setConfirmOpen(true)} // ⬅️ Trigger ConfirmDialog
            variant="danger"
            icon={<FiTrash2 className="w-5 h-5" />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Delete"
          />
          <Button
            onClick={() => downloadAsJson(prompt, prompt.title || 'prompt')}
            variant="primary"
            icon={<FiDownload className="w-5 h-5" />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Export"
          />
        </div>
      </div>

      {/* Try in Platform → under card */}
      <TryInPlatformButtons promptText={prompt.content} onShowToast={onShowToast} />

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          onDelete(prompt.id);
          setConfirmOpen(false);
        }}
        title={`Delete "${prompt.title}"?`}
        description="Are you sure you want to delete this prompt? This action cannot be undone."
      />
    </div>
  );
}
