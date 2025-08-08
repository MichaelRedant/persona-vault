// src/components/ListingDetailsModal.jsx
import React from 'react';

export default function ListingDetailsModal({ item, onClose, onDownload }) {
  const price = item.price_cents > 0 ? `€ ${(item.price_cents / 100).toFixed(2)}` : 'Free';

  return (
    <div className="absolute left-0 top-full mt-2 w-full z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 animate-slideUp">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-1 text-gray-800 dark:text-gray-100">{item.title}</h3>
        {item.seller_name && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">By {item.seller_name}</p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-line">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{price}</span>
          <button
            className="text-sm px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-600 text-white"
            onClick={onDownload}
          >
            Download
          </button>
        </div>
      </div>
      <style jsx="true">{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
