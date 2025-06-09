import { useState, useEffect } from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';
import { FiX } from 'react-icons/fi';

export default function FloatingInstallBanner() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [showBanner, setShowBanner] = useState(false);

  // Detect iOS → iOS Safari does NOT support beforeinstallprompt
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;

  useEffect(() => {
    const dismissed = localStorage.getItem('vault_installBanner_dismissed');
    // Only show banner if:
    // - Not iOS (no beforeinstallprompt support)
    // - Not already dismissed
    // - Is installable (beforeinstallprompt fired)
    // - Not already running as standalone (installed)
    if (!isIos && !isInStandaloneMode && !dismissed && isInstallable) {
      console.log('FloatingInstallBanner → showing banner'); // Debug log
      setShowBanner(true);
    }
  }, [isInstallable, isIos, isInStandaloneMode]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('vault_installBanner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-xl rounded-full px-5 py-3 flex items-center space-x-4 animate-fade-in backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
      <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">📲 Install Persona Vault App</span>
      <button
        onClick={async () => {
          const result = await promptInstall();
          console.log('Install result:', result);
          setShowBanner(false); // Hide banner after install
          localStorage.setItem('vault_installBanner_dismissed', 'true');
        }}
        className="px-4 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold"
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        title="Dismiss"
      >
        <FiX className="text-lg" />
      </button>

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
