import { useState } from 'react';
import { downloadAsJson } from '../utils/downloadAsJson';
import TryInPlatformButtons from './TryInPlatformButtons';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FiEdit2, FiTrash2, FiDownload, FiCopy } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';
import Button from './Button';

export default function PersonaCard({ persona, compactMode, onToggleFavorite, onDelete, onEdit, onShowToast }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        onShowToast('Persona description copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy!', err);
      });
  };

  const tagsArray = Array.isArray(persona.tags)
    ? persona.tags
    : typeof persona.tags === 'string'
      ? persona.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  return (
    <div className={`bg-gradient-to-tr from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 ${compactMode ? 'p-3 mb-4' : 'p-6 mb-6'} transition-transform transform hover:scale-[1.02] hover:shadow-xl duration-200 ease-in-out`}>

      <div className="flex justify-between items-start flex-wrap gap-4">
        {/* Content */}
        <div>
          <h2 className={`font-bold text-gray-900 dark:text-white mb-1 ${compactMode ? 'text-lg' : 'text-xl'}`}>
  {persona.name}
</h2>

<div
  className={`max-h-52 overflow-y-auto mb-2 pr-1 ${compactMode ? 'text-xs' : 'text-sm'} text-gray-500 prose prose-sm dark:prose-invert`}
  dangerouslySetInnerHTML={{ __html: persona.description }}
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
        <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
          <Button
            onClick={() => onToggleFavorite(persona.id, persona.favorite)}
            variant="success"
            icon={persona.favorite ? <AiFillStar /> : <AiOutlineStar />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Favorite"
          />

          <Button
            onClick={() => handleCopy(persona.description)}
            variant="secondary"
            icon={<FiCopy />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Copy to Clipboard"
          />

          <Button
            onClick={() => onEdit(persona)}
            variant="primary"
            icon={<FiEdit2 />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Edit"
          />

          <Button
            onClick={() => setConfirmOpen(true)}
            variant="danger"
            icon={<FiTrash2 />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Delete"
          />

          <Button
            onClick={() => downloadAsJson(persona, persona.name || 'persona')}
            variant="primary"
            icon={<FiDownload />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Export"
          />
        </div>
      </div>

      {/* Try in Platform → under card */}
      <TryInPlatformButtons promptText={persona.description} onShowToast={onShowToast} />

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          onDelete(persona.id);
          setConfirmOpen(false);
        }}
        title={`Delete "${persona.name}"?`}
        description="Are you sure you want to delete this Persona? This action cannot be undone."
      />
    </div>
  );
}
