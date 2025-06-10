// src/components/Toast.jsx
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose();
        }, 300); // fade out anim
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!visible || !message) return null;

  // Select icon and styles
  const iconMap = {
    success: <FiCheckCircle className="w-5 h-5 text-green-400" />,
    info: <FiInfo className="w-5 h-5 text-blue-400" />,
    error: <FiXCircle className="w-5 h-5 text-red-400" />
  };

  const bgMap = {
    success: 'bg-green-50 border-green-400 text-green-700',
    info: 'bg-blue-50 border-blue-400 text-blue-700',
    error: 'bg-red-50 border-red-400 text-red-700'
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] max-w-sm w-full border rounded-lg shadow-lg px-4 py-3 flex items-center space-x-3 transition-transform transform ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      } ${bgMap[type]} animate-fadeIn`}
    >
      {iconMap[type]}
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => {
            onClose();
          }, 300);
        }}
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
      >
        <FiXCircle className="w-4 h-4" />
      </button>

      {/* Animations */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
