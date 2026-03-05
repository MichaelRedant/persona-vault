import { useMemo, useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FiClock, FiCopy, FiDownload, FiEdit2, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { downloadAsJson } from '../utils/downloadAsJson';
import { htmlToPlainText, sanitizeRichHtml } from '../utils/sanitizeHtml';
import Button from './Button';
import CardActionsDropdown from './CardActionsDropdown';
import ConfirmDialog from './ConfirmDialog';
import TryInPlatformButtons from './TryInPlatformButtons';

export default function PromptCard({
  prompt,
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

  const tagsArray = Array.isArray(prompt.tags)
    ? prompt.tags
    : typeof prompt.tags === 'string'
      ? prompt.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];

  const safeContent = useMemo(
    () => sanitizeRichHtml(prompt.content || ''),
    [prompt.content]
  );

  const cardActions = [
    ...(canEditWorkspace
      ? [
          {
            label: 'Edit',
            icon: <FiEdit2 className="w-5 h-5" />,
            onClick: () => onEdit(prompt),
          },
          {
            label: 'Delete',
            icon: <FiTrash2 className="w-5 h-5" />,
            danger: true,
            onClick: () => setConfirmOpen(true),
          },
        ]
      : []),
    {
      label: 'Download',
      icon: <FiDownload className="w-5 h-5" />,
      onClick: () => downloadAsJson(prompt, prompt.title || 'prompt'),
    },
    {
      label: 'Revisions',
      icon: <FiClock />,
      onClick: () => onViewRevisions(prompt),
    },
  ];

  return (
    <div className={`card-container relative pv-card ${compactMode ? 'p-2 mb-3' : 'p-6 mb-6'} animate-fadeIn`}>
      <div className="flex justify-between items-start flex-wrap sm:flex-nowrap gap-4">
        <div>
          <h2 className={`font-bold mb-1 pv-heading ${compactMode ? 'text-lg' : 'text-xl'}`}>
            {prompt.title}
          </h2>

          <div
            className={`max-h-[150px] overflow-y-auto mb-2 pr-1 ${compactMode ? 'text-xs' : 'text-sm'} pv-subtle prose prose-sm dark:prose-invert max-w-none`}
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          {!compactMode && tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tagsArray.map((tag) => (
                <span key={tag} className="pv-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end sm:justify-start mt-4 sm:mt-0 items-center">
          {canEditWorkspace && (
            <Button
              onClick={() => onToggleFavorite(prompt.id, prompt.favorite)}
              variant="success"
              icon={prompt.favorite ? <AiFillStar /> : <AiOutlineStar />}
              className="w-10 h-10 text-xl p-0 flex items-center justify-center"
              aria-label={prompt.favorite ? `Remove ${prompt.title} from favorites` : `Add ${prompt.title} to favorites`}
              title="Favorite"
            />
          )}

          <Button
            onClick={() => handleCopy(safeContent)}
            variant="secondary"
            icon={<FiCopy className="w-5 h-5" />}
            className="w-10 h-10 text-xl p-0 flex items-center justify-center"
            aria-label={`Copy content for ${prompt.title}`}
            title="Copy"
          />

          {canEditWorkspace && (
            <Button
              onClick={() => onUpload(prompt)}
              variant="primary"
              icon={<FiUploadCloud className="w-5 h-5" />}
              className="w-10 h-10 text-xl p-0 flex items-center justify-center"
              aria-label={`Upload ${prompt.title} to marketplace`}
              title="Upload to marketplace"
            />
          )}

          <CardActionsDropdown
            actions={cardActions}
          />
        </div>
      </div>

      {!compactMode && (
        <TryInPlatformButtons onShowToast={onShowToast} />
      )}

      {canEditWorkspace && (
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
      )}
    </div>
  );
}
