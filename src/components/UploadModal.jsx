// src/components/UploadModal.jsx
import { useRef, useState } from 'react';

export default function UploadModal({ open, onClose, onUploaded, uploadFn }) {
  const dropRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState('');

  if (!open) return null;

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  };
  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
  };
  const doUpload = async (file) => {
    setBusy(true); setFileName(file.name); setProgress(0);
    try {
      const res = await uploadFn(file, setProgress);
      onUploaded(res);
      onClose();
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-6" onClick={e=>e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Upload cover / asset</h3>
        <div
          ref={dropRef}
          onDragOver={(e)=>e.preventDefault()}
          onDrop={onDrop}
          className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          Drag & drop file here
          <div className="my-3">or</div>
          <label className="inline-block px-3 py-1.5 rounded bg-blue-600 text-white cursor-pointer">
            Choose file
            <input type="file" className="hidden" onChange={onPick} disabled={busy}/>
          </label>
          {busy && (
            <div className="mt-4">
              <div className="text-xs mb-1">{fileName}</div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                <div className="h-2 bg-blue-500 rounded" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-right text-xs mt-1">{progress}%</div>
            </div>
          )}
        </div>
        <div className="mt-4 text-right">
          <button className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50 dark:hover:bg-gray-800" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
