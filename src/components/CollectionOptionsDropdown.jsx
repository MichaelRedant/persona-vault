import { useState, useEffect, useRef } from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';

export default function CollectionOptionsDropdown({ collection, onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click and Escape key.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setRenaming(false);
        setEditName(collection.name); // reset name
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setRenaming(false);
        setEditName(collection.name);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, collection.name]);

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== collection.name) {
      onRename(collection.id, trimmed);
    }
    setRenaming(false);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label={`Open options for collection ${collection.name}`}
        title="More options"
        className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
      >
        <FiMoreVertical className="text-xl" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-2 space-y-2 transition ease-out duration-150 scale-95 opacity-0 animate-fadeIn"
        >
          {renaming ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') {
                    setRenaming(false);
                    setEditName(collection.name);
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="flex justify-end gap-2 text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenaming(false);
                    setEditName(collection.name);
                  }}
                  className="px-3 py-1 rounded hover:underline text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenaming(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                <FiEdit2 /> Rename collection
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-red-100 dark:hover:bg-red-800 text-sm text-red-600 dark:text-red-300"
              >
                <FiTrash2 /> Delete collection
              </button>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          onDelete(collection.id);
          setOpen(false);
        }}
        title={`Delete collection "${collection.name}"?`}
        description="This action cannot be undone."
      />
    </div>
  );
}
