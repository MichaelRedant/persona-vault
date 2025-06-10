import { useState } from 'react';
import { downloadAsJson } from '../utils/downloadAsJson';
import TryInPlatformButtons from './TryInPlatformButtons';
import Button from './Button';
import ConfirmDialog from './ConfirmDialog';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FiEdit2, FiTrash2, FiDownload, FiCopy } from 'react-icons/fi';

export default function PromptCard({ prompt, compactMode, onToggleFavorite, onDelete, onEdit, onShowToast }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopy = (htmlContent) => {
  // ✅ create temp DOM element to strip tags
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlContent;
  const plainText = tempElement.innerText;

  navigator.clipboard.writeText(plainText)
    .then(() => {
      onShowToast('Copied full content to clipboard!');
    })
    .catch((err) => {
      console.error('Failed to copy!', err);
      onShowToast('Failed to copy content.');
    });
};

  const tagsArray = Array.isArray(prompt.tags)
    ? prompt.tags
    : typeof prompt.tags === 'string'
      ? prompt.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  return (
    <div className={`bg-gradient-to-tr from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 ${compactMode ? 'p-2 mb-3' : 'p-6 mb-6'} transition-transform transform hover:scale-[1.02] hover:shadow-xl duration-200 ease-in-out animate-fadeIn`}>

      <div className="flex justify-between items-start flex-wrap sm:flex-nowrap">
        {/* Content */}
        <div>
          <h2 className={`font-bold text-gray-900 dark:text-white mb-1 ${compactMode ? 'text-lg' : 'text-xl'}`}>
  {prompt.title}
</h2>

<div
  className={`max-h-52 overflow-y-auto mb-2 pr-1 ${compactMode ? 'text-xs' : 'text-sm'} text-gray-500 prose prose-sm dark:prose-invert`}
  dangerouslySetInnerHTML={{ __html: prompt.content }}
/>



          {!compactMode && (
            <div className="flex flex-wrap gap-2">
              {tagsArray.map(tag => (
                <span
                  key={tag}
                  className="font-medium rounded-full px-2.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
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
            onClick={() => setConfirmOpen(true)}
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

      {/* TryInPlatformButtons → in CompactMode weghalen */}
      {!compactMode && (
        <TryInPlatformButtons promptText={prompt.content} onShowToast={onShowToast} />
      )}

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
