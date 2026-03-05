import { useEffect, useMemo, useState } from 'react';
import { diffWords } from 'diff';
import Button from './Button';
import Modal from './Modal';
import StatePanel from './StatePanel';

const FIELD_CONFIG = {
  persona: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', richText: true },
    { key: 'tags', label: 'Tags' },
    { key: 'collection_ids', label: 'Collections' },
  ],
  prompt: [
    { key: 'title', label: 'Title' },
    { key: 'content', label: 'Content', richText: true },
    { key: 'category', label: 'Category' },
    { key: 'tags', label: 'Tags' },
  ],
};

function stripHtml(value) {
  const input = String(value || '');
  if (typeof document === 'undefined') {
    return input.replace(/<[^>]*>/g, ' ');
  }

  const temp = document.createElement('div');
  temp.innerHTML = input;
  return temp.textContent || temp.innerText || '';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeValue(value, richText = false) {
  const normalized = Array.isArray(value)
    ? value.join(', ')
    : value == null
      ? ''
      : String(value);

  return richText ? stripHtml(normalized) : normalized;
}

function renderDiffHtml(previousValue = '', currentValue = '', richText = false) {
  const before = normalizeValue(previousValue, richText);
  const after = normalizeValue(currentValue, richText);
  const parts = diffWords(before, after);

  return parts
    .map((part) => {
      if (part.added) {
        return `<ins class="bg-emerald-200 dark:bg-emerald-900/60 px-1 rounded-sm no-underline">${escapeHtml(part.value)}</ins>`;
      }
      if (part.removed) {
        return `<del class="bg-rose-200 dark:bg-rose-900/60 px-1 rounded-sm line-through">${escapeHtml(part.value)}</del>`;
      }
      return `<span>${escapeHtml(part.value)}</span>`;
    })
    .join('');
}

function formatTimestamp(value) {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleString();
}

function buildRevisionTitle(revision, type) {
  if (type === 'persona') {
    return revision.name || '(no persona name)';
  }
  return revision.title || '(no prompt title)';
}

export default function RevisionsModal({
  isOpen,
  onClose,
  revisions = [],
  loading = false,
  onRollback,
  currentItem = null,
  currentPrompt = null,
  type = 'prompt',
  canRollback = true,
}) {
  const entityType = type === 'persona' ? 'persona' : 'prompt';
  const label = entityType === 'persona' ? 'Persona' : 'Prompt';
  const fields = FIELD_CONFIG[entityType];

  const activeItem = currentItem || currentPrompt || {};
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedRevisionId(revisions[0]?.id || null);
  }, [isOpen, revisions, activeItem?.id]);

  const selectedRevision = useMemo(
    () => revisions.find((revision) => revision.id === selectedRevisionId) || null,
    [revisions, selectedRevisionId]
  );

  const changedFieldCount = (revision) => {
    return fields.reduce((count, field) => {
      const previousValue = normalizeValue(revision[field.key], field.richText);
      const currentValue = normalizeValue(activeItem[field.key], field.richText);
      return count + (previousValue !== currentValue ? 1 : 0);
    }, 0);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" className="w-[95vw]" ariaLabel={`${label} revision history`}>
      <div className="w-[95vw] max-h-[90vh] pv-panel p-6 overflow-hidden flex flex-col gap-5">
        <div>
          <h2 className="text-2xl pv-heading">{label} Revision History</h2>
          <p className="mt-1 text-sm pv-subtle">
            Compare saved revisions with the current version and preview rollback before applying it.
          </p>
        </div>

        {loading ? (
          <StatePanel
            variant="loading"
            title="Loading revisions..."
            description={`Fetching ${label.toLowerCase()} history.`}
          />
        ) : revisions.length === 0 ? (
          <StatePanel
            variant="empty"
            title="No revisions available"
            description={`No saved revisions found for this ${label.toLowerCase()}.`}
          />
        ) : (
          <div className="flex flex-col md:flex-row gap-5 overflow-hidden flex-1">
            <aside className="w-full md:w-[340px] flex-shrink-0 overflow-y-auto pr-1">
              <h3 className="text-base font-semibold pv-heading mb-3">Saved Revisions</h3>
              <ul className="space-y-2 pb-4">
                {revisions.map((revision) => {
                  const isSelected = selectedRevision?.id === revision.id;
                  const title = buildRevisionTitle(revision, entityType);
                  const changes = changedFieldCount(revision);

                  return (
                    <li key={revision.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedRevisionId(revision.id)}
                        className={`w-full text-left pv-card p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="text-sm font-semibold pv-heading truncate">{title}</div>
                        <div className="mt-1 text-xs pv-subtle">{formatTimestamp(revision.created_at)}</div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 px-2 py-0.5 text-xs font-medium">
                          {changes} field{changes === 1 ? '' : 's'} changed
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <section className="flex-1 overflow-y-auto pr-1">
              {!selectedRevision ? (
                <StatePanel
                  variant="empty"
                  title="No revision selected"
                  description="Select a revision from the list to compare and preview rollback."
                />
              ) : (
                <div className="space-y-4">
                  <div className="pv-panel p-4">
                    <h3 className="text-base font-semibold pv-heading mb-3">Diff vs Current Version</h3>
                    <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
                      {fields.map((field) => (
                        <div key={field.key}>
                          <p className="font-semibold pv-heading mb-1">{field.label}</p>
                          <div
                            className="rounded-md border border-[var(--pv-border)] bg-[var(--pv-surface)] p-3 whitespace-pre-wrap break-words"
                            dangerouslySetInnerHTML={{
                              __html: renderDiffHtml(
                                selectedRevision[field.key],
                                activeItem[field.key],
                                field.richText
                              ),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pv-panel p-4">
                    <h3 className="text-base font-semibold pv-heading mb-3">Rollback Preview</h3>
                    <p className="text-sm pv-subtle mb-3">
                      Applying rollback will overwrite the current {label.toLowerCase()} with this revision snapshot.
                    </p>
                    <div className="space-y-3 text-sm">
                      {fields.map((field) => (
                        <div key={`preview-${field.key}`}>
                          <p className="font-semibold pv-heading mb-1">{field.label}</p>
                          <div className="rounded-md border border-[var(--pv-border)] bg-[var(--pv-surface)] p-3 whitespace-pre-wrap break-words">
                            {normalizeValue(selectedRevision[field.key], field.richText) || <span className="pv-subtle">(empty)</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      {canRollback ? (
                        <Button variant="danger" onClick={() => onRollback?.(selectedRevision)}>
                          Rollback to This Revision
                        </Button>
                      ) : (
                        <p className="text-sm pv-subtle">Rollback requires editor or admin role.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        <div className="pt-3 flex justify-end border-t border-[var(--pv-border)]">
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    </Modal>
  );
}
