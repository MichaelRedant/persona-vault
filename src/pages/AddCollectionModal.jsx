import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '../components/Button';

export default function AddCollectionModal({ isOpen, onClose, onAdd }) {
  const [collectionName, setCollectionName] = useState('');

  // Reset field when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCollectionName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (collectionName.trim() !== '') {
      onAdd(collectionName.trim());
      setCollectionName('');
    }
  };

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

        {/* Modal title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Collection</h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Collection Name
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={collectionName.trim() === ''}>
              Add Collection
            </Button>
          </div>
        </form>

        {/* Animations */}
        <style jsx="true">{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
