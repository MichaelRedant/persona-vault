import { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

export default function AddCollectionModal({ isOpen, onClose, onAddCollection }) {
  const [name, setName] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAddCollection(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-sm w-full text-left space-y-6 relative animate-scale-in border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FiX className="text-xl" />
        </button>

        {/* Modal content */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Collection</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collection name"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <FiPlus />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Animations */}
        <style jsx="true">{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
