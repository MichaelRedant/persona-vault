import Modal from './Modal';
import Button from './Button';
import { diffWords } from 'diff';
import { useMemo, useState } from 'react';

// Helper: strip HTML for diffing only on visible text (optioneel)
const stripHtml = (html) => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

// Helper: HTML escape (optioneel extra veiligheid)
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

export default function RevisionsModal({
  isOpen,
  onClose,
  revisions,
  loading,
  onRollback,
  currentPrompt = null,
  type = 'prompt'
}) {
  const label = type === 'persona' ? 'Persona' : 'Prompt';
  const [selectedRevision, setSelectedRevision] = useState(null);
  const currentData = useMemo(() => currentPrompt || {}, [currentPrompt]);

  const renderDiffHtml = (oldVal = '', newVal = '') => {
    const diff = diffWords(stripHtml(oldVal), stripHtml(newVal));
    return diff
      .map((part) => {
        if (part.added) return `<ins>${escapeHtml(part.value)}</ins>`;
        if (part.removed) return `<del>${escapeHtml(part.value)}</del>`;
        return escapeHtml(part.value);
      })
      .join('');
  };

  const renderDiffSafe = (oldVal, newVal) => ({
    __html: renderDiffHtml(oldVal, newVal),
  });

  const prepareTags = (tags) =>
    Array.isArray(tags)
      ? tags.join(', ')
      : typeof tags === 'string'
      ? tags
      : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">{label} Revision History</h2>

        {loading ? (
          <div className="text-gray-500 dark:text-gray-300">Loading revisions...</div>
        ) : revisions.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-300">
            No revisions available for this {label.toLowerCase()}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Revision List */}
            <div>
              <h3 className="font-semibold mb-2">Revision List</h3>
              <ul className="space-y-2">
                {revisions.map((rev) => (
                  <li key={rev.id} className="border rounded p-3 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{rev.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Saved at: {new Date(rev.created_at).toLocaleString()}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedRevision(rev)}>
                        Compare
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onRollback(rev)}>
                        Rollback
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comparison */}
            <div>
              <h3 className="font-semibold mb-2">Comparison</h3>
              {!selectedRevision ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Select a revision to compare.</p>
              ) : (
                <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
                  <div>
                    <span className="font-bold">Name:</span>
                    <div className="mt-1" dangerouslySetInnerHTML={renderDiffSafe(selectedRevision.name, currentData.name)} />
                  </div>
                  <div>
                    <span className="font-bold">Description:</span>
                    <div className="mt-1 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={renderDiffSafe(selectedRevision.description, currentData.description)} />
                  </div>
                  <div>
                    <span className="font-bold">Tags:</span>
                    <div className="mt-1" dangerouslySetInnerHTML={renderDiffSafe(prepareTags(selectedRevision.tags), prepareTags(currentData.tags))} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
