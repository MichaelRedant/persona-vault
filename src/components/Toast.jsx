import { useEffect } from 'react';
import { FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // auto close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  // Determine styles based on type
  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: <FiCheckCircle className="w-5 h-5 mr-2" />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <FiAlertTriangle className="w-5 h-5 mr-2" />,
    },
    info: {
      bg: 'bg-blue-500',
      icon: <FiInfo className="w-5 h-5 mr-2" />,
    },
  };

  const { bg, icon } = typeStyles[type] || typeStyles.success;

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 w-auto max-w-sm ${bg} text-white px-6 py-3 rounded-lg shadow-xl z-[9999] flex items-center transition-all duration-500 ease-in-out
        ${message ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}
      `}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}
