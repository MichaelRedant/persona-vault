import { FiLogOut, FiX, FiDownload, FiPlus } from 'react-icons/fi';
import Button from './Button';
import TagAnalyticsWithBadges from './TagAnalyticsWithBadges';

export default function ProfileModal({
  decodedToken,
  onLogout,
  onClose,
  promptCount,
  personaCount,
  favoriteCount,
  tagsUsed,
  promptsWithoutTagCount,
  onNewPrompt,
  onNewPersona,
  onExport,
  personas,           // ✅ toegevoegd
  prompts             // ✅ toegevoegd
}) {
  const { username, email, iat } = decodedToken || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full text-left space-y-6 relative animate-scale-in border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FiX className="text-xl" />
        </button>

        {/* Profile header */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {username || 'Unknown'}
          </h3>
          {email && <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>}
          <p className="text-sm text-gray-500 dark:text-gray-400"></p>
        </div>

        {/* Activity overview */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
            Activity
          </div>
          <div className="grid grid-cols-2 gap-y-1">
            <div>Personas:</div>
            <div className="text-right">{personaCount}</div>

            <div>Other prompts:</div>
            <div className="text-right">{promptCount}</div>

            <div>Favorites:</div>
            <div className="text-right">{favoriteCount}</div>

            <div>Unique tags:</div>
            <div className="text-right">{tagsUsed}</div>

            <div>Prompts without tag:</div>
            <div className="text-right">{promptsWithoutTagCount}</div>
          </div>
        </div>

        {/* Tag Analytics */}
        <TagAnalyticsWithBadges personas={personas} prompts={prompts} topN={5} />

        {/* Login info */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
            Session info
          </div>
          {iat && (
            <p>Logged in at: {new Date(iat * 1000).toLocaleString()}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Button variant="primary" onClick={onNewPersona}>
            <FiPlus className="mr-2" />
            New persona
          </Button>

          <Button variant="primary" onClick={onNewPrompt}>
            <FiPlus className="mr-2" />
            New prompt
          </Button>

          <Button variant="outline" onClick={onExport}>
            <FiDownload className="mr-2" />
            Export all
          </Button>

          <Button variant="danger" onClick={onLogout}>
            <FiLogOut className="mr-2" />
            Log out
          </Button>
        </div>

        {/* Animations */}
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
      </div>
    </div>
  );
}
