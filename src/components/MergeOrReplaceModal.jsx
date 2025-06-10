import React from 'react';
import { FiCheckCircle, FiTrash2, FiX } from 'react-icons/fi';

export default function MergeOrReplaceModal({
  isOpen,
  onMerge,
  onReplace, // 👉 belangrijk: moet nu async aangeroepen worden in Header
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-5 border border-gray-200 dark:border-gray-700 animate-scaleIn">
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">Import Options</h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Do you want to <strong className="text-blue-600">Merge</strong> the imported data with your existing data,<br />
          or <strong className="text-red-600">Replace</strong> all current data?
        </p>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={onMerge}
            className="flex items-center justify-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            <FiCheckCircle className="mr-2 w-5 h-5" />
            Merge (Add Data)
          </button>
          
          <button
            onClick={async () => {
              // ✅ call onReplace as async to allow awaiting in Header
              await onReplace();
            }}
            className="flex items-center justify-center px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
          >
            <FiTrash2 className="mr-2 w-5 h-5" />
            Replace (Overwrite)
          </button>
          
          <button
            onClick={onCancel}
            className="flex items-center justify-center px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
          >
            <FiX className="mr-2 w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
