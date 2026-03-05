import { useEffect, useRef, useState } from 'react';

function listingStatusBadgeClass(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'active') return 'bg-emerald-100 text-emerald-800';
  if (value === 'paused') return 'bg-amber-100 text-amber-800';
  if (value === 'flagged') return 'bg-orange-100 text-orange-800';
  if (value === 'removed') return 'bg-rose-100 text-rose-800';
  return 'bg-gray-100 text-gray-700';
}

function formatEventType(eventType) {
  const normalized = String(eventType || '').toLowerCase();
  if (normalized === 'created') return 'Listing created';
  if (normalized === 'updated') return 'Listing updated';
  if (normalized === 'deleted') return 'Listing deleted';
  if (normalized === 'reported') return 'Report submitted';
  if (normalized === 'report_resolved') return 'Report resolved';
  if (!normalized) return 'Activity';
  return normalized.replace(/_/g, ' ');
}

function formatEventDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function summarizeEventPayload(event) {
  const payload = event?.payload && typeof event.payload === 'object' ? event.payload : null;
  if (!payload) {
    return '';
  }

  if (event?.event_type === 'updated') {
    const changes = payload.changes && typeof payload.changes === 'object' ? payload.changes : null;
    const fields = changes ? Object.keys(changes) : [];
    if (fields.length > 0) {
      return `Changed: ${fields.join(', ')}`;
    }
  }

  if (event?.event_type === 'reported' && payload.reason) {
    return `Reason: ${payload.reason}`;
  }

  if (event?.event_type === 'report_resolved' && payload.report_status_to) {
    const listingStatus = payload.listing_status_to ? `, listing ${payload.listing_status_to}` : '';
    return `Set report ${payload.report_status_to}${listingStatus}`;
  }

  return '';
}

export default function ListingDetailsModal({
  item,
  onClose,
  onDownload,
  canManage = false,
  canReport = false,
  canViewEvents = false,
  events = [],
  eventsLoading = false,
  eventsError = '',
  onReport,
  onCopyLink,
}) {
  const price = Number(item?.price_cents) > 0
    ? `EUR ${(Number(item.price_cents) / 100).toFixed(2)}`
    : 'Free';

  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;
  const description = String(item?.description || '');
  const isLong = description.length > maxLength;
  const displayText = expanded || !isLong ? description : `${description.slice(0, maxLength)}...`;

  const titleId = useRef(`listing-title-${item?.id || 'x'}`);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
    >
      <div
        className="w-full max-w-2xl md:max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden animate-scaleIn"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <h3
            id={titleId.current}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 pr-8"
          >
            {item?.title || 'Listing'}
          </h3>
          {item?.seller_name && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              By {item.seller_name}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {item?.seller_verified && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Verified creator
              </span>
            )}
            {item?.trusted_seller && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Trusted seller
              </span>
            )}
            {item?.status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${listingStatusBadgeClass(item.status)}`}>
                {item.status}
              </span>
            )}
            {item?.visibility && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                {item.visibility}
              </span>
            )}
            {Array.isArray(item?.tags) && item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            x
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
            {item?.cover_url ? (
              <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={item.cover_url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="hidden md:block rounded-xl bg-gray-100 dark:bg-gray-700" />
            )}

            <div>
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line break-words">
                {displayText}
                {isLong && !expanded && (
                  <button
                    type="button"
                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    onClick={() => setExpanded(true)}
                  >
                    Read more
                  </button>
                )}
                {isLong && expanded && (
                  <button
                    type="button"
                    className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                    onClick={() => setExpanded(false)}
                  >
                    Less
                  </button>
                )}
              </p>

              <div className="mt-4 text-xs pv-subtle">
                {Number(item?.downloads_count || 0)} downloads | {Number(item?.favorites_count || 0)} favorites
              </div>

              {canManage && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  You can moderate this listing via the edit or moderation actions.
                </p>
              )}

              <section className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Lifecycle history</h4>
                {!canViewEvents ? (
                  <p className="mt-2 text-xs pv-subtle">Sign in to view listing history.</p>
                ) : eventsLoading ? (
                  <p className="mt-2 text-xs pv-subtle">Loading history...</p>
                ) : eventsError ? (
                  <p className="mt-2 text-xs text-red-600">{eventsError}</p>
                ) : events.length === 0 ? (
                  <p className="mt-2 text-xs pv-subtle">No lifecycle activity logged yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {events.map((event) => {
                      const summary = summarizeEventPayload(event);
                      return (
                        <li key={event.id} className="rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs">
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {formatEventType(event.event_type)}
                          </p>
                          <p className="pv-subtle">
                            {event.actor_name || 'System'} | {formatEventDate(event.created_at)}
                          </p>
                          {summary && <p className="mt-0.5 pv-subtle">{summary}</p>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {price}
                </span>
                <div className="flex items-center gap-2">
                  {onCopyLink && (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                      onClick={onCopyLink}
                    >
                      Copy Link
                    </button>
                  )}
                  {canReport && (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-md border border-amber-500 text-amber-700 text-sm font-medium hover:bg-amber-50"
                      onClick={onReport}
                    >
                      Report
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onDownload}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx="true">{`
          @keyframes scaleIn {
            from { opacity: 0; transform: translateY(6px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-scaleIn { animation: scaleIn 0.18s ease-out both; }
        `}</style>
      </div>
    </div>
  );
}
