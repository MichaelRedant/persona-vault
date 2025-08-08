import Modal from './Modal';
import Button from './Button';
import { diffWords } from 'diff';
import { useState, useEffect } from 'react';

// 🔒 HTML-stripping helper
const stripHtml = (html) => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

// 🛡️ HTML escape helper
const escapeHtml = (unsafe) => unsafe
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

// 🔍 Render diff to safe HTML
const renderDiffHtml = (oldVal = '', newVal = '') => {
  const diff = diffWords(stripHtml(oldVal), stripHtml(newVal));
  return diff.map((part) => {
    if (part.added) return `<ins class="bg-green-200 dark:bg-green-800 px-1">${escapeHtml(part.value)}</ins>`;
    if (part.removed) return `<del class="bg-red-200 dark:bg-red-800 px-1 line-through">${escapeHtml(part.value)}</del>`;
    return `<span>${escapeHtml(part.value)}</span>`;
  }).join('');
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
  const currentData = currentPrompt || {};

  useEffect(() => {
    setSelectedRevision(null);
  }, [currentPrompt?.id, revisions, isOpen]);

  if (!isOpen) return null;

  const renderDiffSafe = (oldVal, newVal) => ({
    __html: renderDiffHtml(oldVal, newVal),
  });

  const prepareTags = (tags) =>
    Array.isArray(tags) ? tags.join(', ')
    : typeof tags === 'string' ? tags
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" className="w-[95vw]">
      <div className="w-[95vw] max-h-[90vh] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col gap-6">


        <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
      {label} Revision History
    </h2>

        {loading ? (
          <div className="text-gray-500 dark:text-gray-300">Loading revisions...</div>
        ) : revisions.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-300">
            No revisions available for this {label.toLowerCase()}.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-1">

            {/* Sidebar: Revision List */}
           <div className="w-full md:w-[340px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto pr-2">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Revision List</h3>
              <ul className="space-y-2 pb-4">
                {revisions.map((rev) => (
                  <li
                    key={rev.id}
                    className={`border rounded-lg p-3 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedRevision?.id === rev.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {rev.name || rev.title || '(no title)'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(rev.created_at).toLocaleString()}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
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

            {/* Main: Comparison */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Comparison</h3>

              {!selectedRevision ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Select a revision to compare.</p>
              ) : (
                <div className="space-y-6 text-sm text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none">
                  <div>
                    <p className="font-bold">Name:</p>
                    <div dangerouslySetInnerHTML={renderDiffSafe(selectedRevision.name, currentData.name)} />
                  </div>
                  <div>
                    <p className="font-bold">Description:</p>
                    <div dangerouslySetInnerHTML={renderDiffSafe(selectedRevision.description, currentData.description)} />
                  </div>
                  <div>
                    <p className="font-bold">Tags:</p>
                    <div dangerouslySetInnerHTML={renderDiffSafe(prepareTags(selectedRevision.tags), prepareTags(currentData.tags))} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
