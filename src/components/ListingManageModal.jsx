// src/components/ListingManageModal.jsx
import { useState, useEffect, useId } from 'react';
import Modal from './Modal';

export default function ListingManageModal({
  open,
  onClose,
  onSave,
  onDelete,
  initial = {},
  uploadFn,
  onShowToast,
  itemOptions = {},
  loadingItemOptions = false,
  lockItemSelection = false,
  allowStatusEdit = false,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const typeId = useId();
  const sourceItemId = useId();
  const priceId = useId();
  const coverId = useId();
  const headingId = useId();
  const safeInitial = initial || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [itemType, setItemType] = useState('persona');
  const [itemId, setItemId] = useState('');
  const [coverFileId, setCoverFileId] = useState(null);
  const [status, setStatus] = useState('active');
  const [busy, setBusy] = useState(false);

  const personaOptions = Array.isArray(itemOptions.personas) ? itemOptions.personas : [];
  const promptOptions = Array.isArray(itemOptions.prompts) ? itemOptions.prompts : [];
  const currentOptions = itemType === 'prompt' ? promptOptions : personaOptions;
  const hasPreselectedItem = Number(safeInitial.item_id) > 0;
  const isEditingListing = Number(safeInitial.id) > 0;

  useEffect(() => {
    setTitle(safeInitial.title || '');
    setDescription(safeInitial.description || '');
    setPrice(safeInitial.price_cents ? safeInitial.price_cents / 100 : 0);
    setItemType(safeInitial.item_type || 'persona');
    setItemId(safeInitial.item_id ? String(safeInitial.item_id) : '');
    setCoverFileId(safeInitial.cover_file_id || null);
    setStatus(safeInitial.status || 'active');
  }, [safeInitial.title, safeInitial.description, safeInitial.price_cents, safeInitial.item_type, safeInitial.item_id, safeInitial.cover_file_id, safeInitial.status, open]);

  if (!open) return null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadFn(file);
      setCoverFileId(res.file_id);
    } catch (err) {
      onShowToast?.(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const resolvedItemId = hasPreselectedItem ? Number(safeInitial.item_id) : Number(itemId);

    if (!title.trim()) {
      onShowToast?.('Title is required');
      return;
    }

    if (!resolvedItemId && !isEditingListing) {
      onShowToast?.('Select an item to list');
      return;
    }

    onSave({
      ...safeInitial,
      title: title.trim(),
      description,
      price_cents: 0,
      item_type: itemType,
      item_id: resolvedItemId || undefined,
      cover_file_id: coverFileId,
      ...(allowStatusEdit && isEditingListing ? { status } : {}),
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="lg"
      className="w-full max-w-lg rounded-xl"
      ariaLabelledBy={headingId}
    >
      <h3 id={headingId} className="text-lg font-semibold mb-4">{safeInitial.id ? 'Edit Listing' : 'New Listing'}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor={titleId} className="block text-sm mb-1">Title</label>
            <input
              id={titleId}
              className="pv-input text-sm"
              value={title}
              onChange={e=>setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={descriptionId} className="block text-sm mb-1">Description</label>
            <textarea
              id={descriptionId}
              className="pv-input text-sm"
              rows="3"
              value={description}
              onChange={e=>setDescription(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={typeId} className="block text-sm mb-1">Type</label>
            <select
              id={typeId}
              className="pv-input text-sm"
              value={itemType}
              onChange={e => {
                setItemType(e.target.value);
                if (!hasPreselectedItem) {
                  setItemId('');
                }
              }}
              disabled={lockItemSelection}
            >
              <option value="persona">Persona</option>
              <option value="prompt">Prompt</option>
            </select>
          </div>
          {!hasPreselectedItem && !isEditingListing && (
            <div>
              <label htmlFor={sourceItemId} className="block text-sm mb-1">Source item</label>
              <select
                id={sourceItemId}
                className="pv-input text-sm"
                value={itemId}
                onChange={e => setItemId(e.target.value)}
                disabled={loadingItemOptions}
              >
                <option value="">Select an item...</option>
                {currentOptions.map((option) => (
                  <option key={`${option.type}-${option.id}`} value={String(option.id)}>
                    {option.label}
                  </option>
                ))}
              </select>
              {loadingItemOptions && (
                <p className="text-xs text-gray-500 mt-1">Loading available items...</p>
              )}
              {!loadingItemOptions && currentOptions.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No items available for selected type.</p>
              )}
            </div>
          )}
          <div>
            <label htmlFor={priceId} className="block text-sm mb-1">Price</label>
            <input
              id={priceId}
              type="number"
              min="0"
              value={price}
              disabled
              className="pv-input text-sm opacity-70"
            />
            <p className="text-xs text-gray-500 mt-1">Only free listings are supported for now.</p>
          </div>
          {allowStatusEdit && isEditingListing && (
            <div>
              <label htmlFor="listing-status" className="block text-sm mb-1">Moderation status</label>
              <select
                id="listing-status"
                className="pv-input text-sm"
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={busy}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="flagged">Flagged</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor={coverId} className="block text-sm mb-1">Cover</label>
            <input id={coverId} type="file" onChange={handleFile} disabled={busy} />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          {safeInitial.id && (
            <button
              className="text-sm px-3 py-1.5 rounded border border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => onDelete && onDelete(safeInitial.id)}
              aria-label="Delete listing"
            >
              Delete
            </button>
          )}
          <div className="ml-auto space-x-2">
            <button className="text-sm px-3 py-1.5 rounded border" onClick={onClose} aria-label="Cancel listing changes">Cancel</button>
            <button
              className="text-sm px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={save}
              disabled={busy}
              aria-label="Save listing"
            >
              Save
            </button>
          </div>
        </div>
    </Modal>
  );
}
