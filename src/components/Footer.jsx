import { useState, useEffect } from 'react';

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

  // ESC → close modal
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
    <footer className="mt-8 py-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 w-full">
      <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-between items-center">
        <div className="mb-2 sm:mb-0">
          Personas: <strong>{personasCount}</strong> | Prompts:{' '}
          <strong>{promptsCount}</strong> <br />
          {username ? (
            <span>
              {getGreeting()}, <span className="font-semibold">{username}</span>
            </span>
          ) : (
            <span>Not logged in</span>
          )}
        </div>

        {/* Account button → always visible if logged in */}
        {localStorage.getItem('vault_jwt_token') && (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Account
          </button>
        )}
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsProfileModalOpen(false)} // backdrop click close
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4"
            onClick={(e) => e.stopPropagation()} // prevent click inside modal from closing
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account options</p>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  window.location.href = '/profile';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Profile
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('vault_jwt_token');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Log out
              </button>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
