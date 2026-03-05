import { useEffect, useState } from 'react';
import Button from './Button';
import Modal from './Modal';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'copyright', label: 'Copyright/IP concern' },
  { value: 'abuse', label: 'Abusive or harmful content' },
  { value: 'malware', label: 'Security or malware risk' },
  { value: 'other', label: 'Other' },
];

export default function ListingReportModal({
  open,
  item,
  busy = false,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason('spam');
    setDetails('');
  }, [open, item?.id]);

  if (!open || !item) {
    return null;
  }

  const submitReport = () => {
    onSubmit?.(reason, details);
  };

  return (
    <Modal isOpen={open} onClose={onClose} size="md" ariaLabel="Report listing">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report Listing</h3>
          <p className="text-sm pv-subtle mt-1">
            Report "{item.title}" to moderators.
          </p>
        </div>

        <div>
          <label htmlFor="report-reason" className="block text-sm font-medium mb-1">
            Reason
          </label>
          <select
            id="report-reason"
            className="pv-input text-sm"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={busy}
          >
            {REPORT_REASONS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-details" className="block text-sm font-medium mb-1">
            Details (optional)
          </label>
          <textarea
            id="report-details"
            rows={4}
            maxLength={1000}
            className="pv-input text-sm"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Add context for moderators..."
            disabled={busy}
          />
          <p className="text-xs pv-subtle mt-1">{details.length}/1000</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submitReport} disabled={busy}>
            {busy ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
