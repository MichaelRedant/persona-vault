import { useMemo, useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FiClock, FiCopy, FiDownload, FiEdit2, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { downloadAsJson } from '../utils/downloadAsJson';
import { htmlToPlainText, sanitizeRichHtml } from '../utils/sanitizeHtml';
import Button from './Button';
import CardActionsDropdown from './CardActionsDropdown';
import ConfirmDialog from './ConfirmDialog';
import TryInPlatformButtons from './TryInPlatformButtons';

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
  canEditWorkspace = true,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopy = (htmlContent) => {
    const plainText = htmlToPlainText(htmlContent);

    navigator.clipboard.writeText(plainText)
      .then(() => {
        onShowToast('Copied full content to clipboard!');
      })
      .catch(() => {
        onShowToast('Failed to copy content.');
      });
  };

  const tagsArray = Array.isArray(persona.tags)
    ? persona.tags
    : typeof persona.tags === 'string'
      ? persona.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];

  const collectionNames = useMemo(() => {
    if (!Array.isArray(persona.collection_ids) || persona.collection_ids.length === 0) {
      return [];
    }

    return persona.collection_ids
      .map((collectionId) => {
        const match = collections.find((collection) => Number(collection.id) === Number(collectionId));
        return match ? match.name : null;
      })
      .filter(Boolean);
  }, [persona.collection_ids, collections]);

  const safeDescription = useMemo(
    () => sanitizeRichHtml(persona.description || ''),
    [persona.description]
  );

  const cardActions = [
    ...(canEditWorkspace
      ? [
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
        ]
      : []),
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
  ];

  return (
    <div
      className={`card-container relative pv-card ${compactMode ? 'p-3 mb-4' : 'p-6 mb-6'}`}
    >
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex-grow min-w-0">
          <h2 className={`font-bold mb-1 pv-heading ${compactMode ? 'text-lg' : 'text-xl'}`}>
            {persona.name}
          </h2>

          <div
            className={`max-h-[150px] overflow-y-auto mb-2 pr-1 ${compactMode ? 'text-xs' : 'text-sm'} pv-subtle prose prose-sm dark:prose-invert max-w-none`}
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />

          {!compactMode && tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {tagsArray.map((tag) => (
                <span key={tag} className="pv-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {collectionNames.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-2 ${compactMode ? 'text-xs' : 'text-sm'}`}>
              {collectionNames.map((name, index) => (
                <span
                  key={index}
                  title={`Collection: ${name}`}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 truncate max-w-[180px]"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-4 items-center">
          {canEditWorkspace && (
            <Button
              onClick={() => onToggleFavorite(persona.id, persona.favorite)}
              variant="success"
              icon={persona.favorite ? <AiFillStar /> : <AiOutlineStar />}
              className="w-10 h-10 text-xl p-0 flex items-center justify-center"
              aria-label={persona.favorite ? `Remove ${persona.name} from favorites` : `Add ${persona.name} to favorites`}
              title="Favorite"
            />
          )}

          <Button
            onClick={() => handleCopy(safeDescription)}
            variant="secondary"
            icon={<FiCopy />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            aria-label={`Copy content for ${persona.name}`}
            title="Copy"
          />

          {canEditWorkspace && (
            <Button
              onClick={() => onUpload(persona)}
              variant="primary"
              icon={<FiUploadCloud />}
              className="w-10 h-10 text-xl p-0 flex items-center justify-center"
              aria-label={`Upload ${persona.name} to marketplace`}
              title="Upload to marketplace"
            />
          )}

          <CardActionsDropdown
            actions={cardActions}
          />
        </div>
      </div>

      <TryInPlatformButtons onShowToast={onShowToast} />

      {canEditWorkspace && (
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            onDelete(persona.id);
            setConfirmOpen(false);
          }}
          title={`Delete "${persona.name}"?`}
          description="Are you sure you want to delete this persona? This action cannot be undone."
        />
      )}
    </div>
  );
}
