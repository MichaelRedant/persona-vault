// src/components/ListingManageModal.jsx
import { useState, useEffect } from 'react';

export default function ListingManageModal({ open, onClose, onSave, onDelete, initial = {}, uploadFn }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [itemType, setItemType] = useState('persona');
  const [coverFileId, setCoverFileId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setPrice(initial.price_cents ? initial.price_cents / 100 : 0);
      setItemType(initial.item_type || 'persona');
      setCoverFileId(initial.cover_file_id || null);
    }
  }, [initial, open]);

  if (!open) return null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadFn(file);
      setCoverFileId(res.file_id);
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    onSave({
      ...initial,
      title,
      description,
      price_cents: 0,
      item_type: itemType,
      cover_file_id: coverFileId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl p-6" onClick={e=>e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{initial?.id ? 'Edit Listing' : 'New Listing'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={title}
              onChange={e=>setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows="3"
              value={description}
              onChange={e=>setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={itemType}
              onChange={e=>setItemType(e.target.value)}
            >
              <option value="persona">Persona</option>
              <option value="prompt">Prompt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Price</label>
            <input
              type="number"
              min="0"
              value={price}
              disabled
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Only free listings are supported for now.</p>
          </div>
          <div>
            <label className="block text-sm mb-1">Cover</label>
            <input type="file" onChange={handleFile} disabled={busy} />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          {initial?.id && (
            <button
              className="text-sm px-3 py-1.5 rounded border border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => onDelete && onDelete(initial.id)}
            >
              Delete
            </button>
          )}
          <div className="ml-auto space-x-2">
            <button className="text-sm px-3 py-1.5 rounded border" onClick={onClose}>Cancel</button>
            <button
              className="text-sm px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={save}
              disabled={busy}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
