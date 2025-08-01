export default function Modal({ isOpen, onClose, children, size = 'lg', className = '' }) {
  if (!isOpen) return null;

  // Mapping voor standaard breedtes
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full w-full', // voor fullscreen modals
    none: '', // laat de calling component volledig bepalen
  };

  const widthClass = sizeMap[size] || sizeMap['lg'];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${widthClass} ${className} max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fadeIn`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ×
        </button>
        {children}
      </div>

      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
