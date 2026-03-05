import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import CardActionsDropdown from './CardActionsDropdown';

function listingStatusBadgeClass(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'active') return 'bg-emerald-100 text-emerald-800';
  if (value === 'paused') return 'bg-amber-100 text-amber-800';
  if (value === 'flagged') return 'bg-orange-100 text-orange-800';
  if (value === 'removed') return 'bg-rose-100 text-rose-800';
  return 'bg-gray-100 text-gray-700';
}

export default function ListingCard({ item, onDownload, onClick, onEdit, onDelete, canManage }) {
  const price = Number(item.price_cents) > 0
    ? `EUR ${(Number(item.price_cents) / 100).toFixed(2)}`
    : 'Free';

  return (
    <div className="card-container relative pv-card p-3 flex flex-col">
      {canManage && (
        <div className="absolute top-2 right-2">
          <CardActionsDropdown
            actions={[
              { label: 'Edit', icon: <FiEdit2 />, onClick: onEdit },
              { label: 'Delete', icon: <FiTrash2 />, onClick: onDelete, danger: true },
            ]}
          />
        </div>
      )}

      <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden mb-3">
        {item.cover_url ? (
          <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No cover</div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold pv-heading line-clamp-2">{item.title}</h3>
        <p className="text-xs pv-subtle mt-1 capitalize">{item.item_type}</p>
        {item.seller_name && (
          <p className="text-xs pv-subtle mt-1">By {item.seller_name}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          {item.seller_verified && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
              Verified creator
            </span>
          )}
          {item.trusted_seller && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
              Trusted seller
            </span>
          )}
          {item.status && String(item.status).toLowerCase() !== 'active' && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${listingStatusBadgeClass(item.status)}`}>
              {item.status}
            </span>
          )}
        </div>

        <p className="text-[11px] pv-subtle mt-2">
          {Number(item.downloads_count || 0)} downloads • {Number(item.favorites_count || 0)} favorites
        </p>

        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold pv-heading">{price}</span>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-[var(--pv-radius-md)] bg-[var(--pv-accent)] px-3 py-1 text-sm font-medium text-white hover:bg-[var(--pv-accent-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={onDownload}
        >
          Download
        </button>
      </div>

      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded-md border border-[var(--pv-border)] bg-[var(--pv-surface)] px-2 py-1 text-xs font-medium text-[var(--pv-text)] hover:bg-[var(--pv-surface-muted)]"
        onClick={onClick}
      >
        Open Details
      </button>
    </div>
  );
}
