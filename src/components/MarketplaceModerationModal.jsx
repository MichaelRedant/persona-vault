import Button from './Button';
import Modal from './Modal';
import StatePanel from './StatePanel';

function statusClass(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'open') return 'bg-amber-100 text-amber-800';
  if (normalized === 'reviewed') return 'bg-sky-100 text-sky-800';
  if (normalized === 'resolved') return 'bg-emerald-100 text-emerald-800';
  if (normalized === 'dismissed') return 'bg-gray-100 text-gray-700';
  return 'bg-gray-100 text-gray-700';
}

export default function MarketplaceModerationModal({
  open,
  onClose,
  reports = [],
  loading = false,
  workingReportId = null,
  onResolve,
}) {
  if (!open) {
    return null;
  }

  return (
    <Modal isOpen={open} onClose={onClose} size="2xl" ariaLabel="Marketplace moderation">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Moderation Queue</h3>
            <p className="text-sm pv-subtle mt-1">Review incoming listing reports and apply moderation actions.</p>
          </div>
          <span className="text-xs pv-subtle">{reports.length} report(s)</span>
        </div>

        {loading ? (
          <StatePanel
            variant="loading"
            title="Loading reports..."
            description="Fetching moderation queue."
          />
        ) : reports.length === 0 ? (
          <StatePanel
            variant="empty"
            title="No reports"
            description="No open moderation reports for this workspace."
          />
        ) : (
          <div className="max-h-[65vh] overflow-y-auto space-y-3 pr-1">
            {reports.map((report) => {
              const isWorking = workingReportId === Number(report.id);
              return (
                <div
                  key={report.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/30 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {report.listing_title || `Listing #${report.listing_id}`}
                      </p>
                      <p className="text-xs pv-subtle mt-1">
                        Reported by {report.reporter_name || `User #${report.reporter_user_id}`}
                        {' '}for <span className="font-medium">{report.reason}</span>
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  {report.details && (
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                      {report.details}
                    </p>
                  )}

                  <div className="text-xs pv-subtle">
                    Listing status: <span className="font-medium">{report.listing_status || 'unknown'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="text-xs px-3 py-1.5"
                      onClick={() => onResolve?.(Number(report.id), 'dismissed', null)}
                      disabled={isWorking}
                    >
                      {isWorking ? 'Working...' : 'Dismiss'}
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-xs px-3 py-1.5"
                      onClick={() => onResolve?.(Number(report.id), 'reviewed', 'paused')}
                      disabled={isWorking}
                    >
                      {isWorking ? 'Working...' : 'Pause Listing'}
                    </Button>
                    <Button
                      variant="danger"
                      className="text-xs px-3 py-1.5"
                      onClick={() => onResolve?.(Number(report.id), 'resolved', 'removed')}
                      disabled={isWorking}
                    >
                      {isWorking ? 'Working...' : 'Remove Listing'}
                    </Button>
                    <Button
                      variant="success"
                      className="text-xs px-3 py-1.5"
                      onClick={() => onResolve?.(Number(report.id), 'resolved', 'active')}
                      disabled={isWorking}
                    >
                      {isWorking ? 'Working...' : 'Reactivate'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
