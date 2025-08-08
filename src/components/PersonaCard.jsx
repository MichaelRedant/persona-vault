import { useState, useMemo } from 'react';
import { downloadAsJson } from '../utils/downloadAsJson';
import TryInPlatformButtons from './TryInPlatformButtons';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FiEdit2, FiTrash2, FiClock, FiDownload, FiCopy, FiUploadCloud } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';
import Button from './Button';
import CardActionsDropdown from './CardActionsDropdown';

export default function PersonaCard({
  persona,
  collections = [],
  compactMode,
  onToggleFavorite,
  onDelete,
  onEdit,
  onShowToast,
  onViewRevisions,
  onUpload = () => {},
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopy = (htmlContent) => {
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

  const tagsArray = Array.isArray(persona.tags)
    ? persona.tags
    : typeof persona.tags === 'string'
      ? persona.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  const collectionNames = useMemo(() => {
    if (!Array.isArray(persona.collection_ids) || persona.collection_ids.length === 0) return [];
    return persona.collection_ids
      .map((cid) => {
        const match = collections.find((col) => Number(col.id) === Number(cid));
        return match ? match.name : null;
      })
      .filter(Boolean);
  }, [persona.collection_ids, collections]);

  return (
    <div className={`bg-gradient-to-tr from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 ${compactMode ? 'p-3 mb-4' : 'p-6 mb-6'} transition-transform transform hover:scale-[1.02] hover:shadow-xl duration-200 ease-in-out`}>
      <div className="flex justify-between items-start flex-wrap gap-4">
        {/* Content */}
        <div className="flex-grow min-w-0">
          <h2 className={`font-bold text-gray-900 dark:text-white mb-1 ${compactMode ? 'text-lg' : 'text-xl'}`}>
            {persona.name}
          </h2>

          <div
            className={`max-h-[150px] overflow-y-auto mb-2 pr-1 ${compactMode ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none`}
            dangerouslySetInnerHTML={{ __html: persona.description }}
          />

          {!compactMode && tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
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

          {/* ✅ Collection badges */}
          {collectionNames.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-2 ${compactMode ? 'text-xs' : 'text-sm'}`}>
              {collectionNames.map((name, index) => (
                <span
                  key={index}
                  title={`Collection: ${name}`}
                  className="font-medium rounded-full px-2.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 truncate max-w-[160px]"
                >
                  📁 {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-center mt-4 items-center">
          <Button
            onClick={() => onToggleFavorite(persona.id, persona.favorite)}
            variant="success"
            icon={persona.favorite ? <AiFillStar /> : <AiOutlineStar />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Favorite"
          />

          <Button
            onClick={() => onUpload(persona)}
            variant="primary"
            icon={<FiUploadCloud />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            title="Upload to marketplace"
          />

          <CardActionsDropdown
            actions={[
              {
                label: 'Copy',
                icon: <FiCopy />,
                onClick: () => handleCopy(persona.description),
              },
              {
                label: 'Edit',
                icon: <FiEdit2 />,
                onClick: () => onEdit(persona),
              },
              {
                label: 'Delete',
                icon: <FiTrash2 />,
                danger: true,
                onClick: () => setConfirmOpen(true),
              },
              {
                label: 'Download',
                icon: <FiDownload />,
                onClick: () => downloadAsJson(persona, persona.name || 'persona'),
              },
              {
                label: 'Revisions',
                icon: <FiClock />,
                onClick: () => onViewRevisions(persona),
              },
            ]}
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
