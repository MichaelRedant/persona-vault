import { useState, useEffect } from 'react';
import { FiSettings } from 'react-icons/fi';
import SettingsModal from './SettingsModal';
import Button from './Button'; // ✅ Industry: gebruik je eigen Button component

export default function Footer({ username, personasCount, promptsCount, onOpenSettings }) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const showSettingsButton = false;
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
        setIsSettingsModalOpen(false);
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

        {showSettingsButton && localStorage.getItem('vault_jwt_token') && (
          <Button
            onClick={onOpenSettings}
            variant="outline" // ✅ industry → Settings is meestal outline style button
            icon={<FiSettings />}
            className="text-sm"
          >
            Settings
          </Button>
        )}
      </div>

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

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
    </footer>
  );
}
