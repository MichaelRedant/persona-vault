import { useState, useEffect } from 'react';
import { FiSettings, FiLogOut, FiX } from 'react-icons/fi';

export default function Footer({ username, personasCount, promptsCount }) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  function getGreeting() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) return '🌅 Good morning';
    if (hour >= 12 && hour < 17) return '☀️ Good afternoon';
    if (hour >= 17 && hour < 21) return '🌇 Good evening';
    return '🌙 Good night';
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <footer className="mt-12 py-6 text-xs text-gray-500 dark:text-gray-400 w-full bg-transparent">
      <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-between items-center">
        <div className="mb-2 sm:mb-0 space-y-1 text-sm">
          <div>
            Personas: <strong>{personasCount}</strong> | Prompts: <strong>{promptsCount}</strong>
          </div>
          <div>
            {username ? (
              <span>
                {getGreeting()}, <span className="font-medium">{username}</span>
              </span>
            ) : (
              <span>Not logged in</span>
            )}
          </div>
        </div>

        {localStorage.getItem('vault_jwt_token') && (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <FiSettings className="text-base" />
            <span>Settings</span>
          </button>
        )}
      </div>

      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <FiX className="text-xl" />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account actions</p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  localStorage.removeItem('vault_jwt_token');
                  window.location.reload();
                }}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                <FiLogOut className="mr-2" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

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
    </footer>
  );
}
