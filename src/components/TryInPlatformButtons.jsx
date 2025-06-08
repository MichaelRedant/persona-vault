import chatgptIcon from '../assets/icons/chatgpt.svg';
import geminiIcon from '../assets/icons/gemini.svg';
import copilotIcon from '../assets/icons/copilot.svg';
import chatgptWhiteIcon from '../assets/icons/chatgpt_white.svg';

export default function TryInPlatformButtons({ promptText, onShowToast }) {
  const encodedPrompt = encodeURIComponent(promptText);

  const chatGptUrl = `https://chat.openai.com/?prompt=${encodedPrompt}`;
  const copilotUrl = `https://copilot.microsoft.com/?q=${encodedPrompt}`;

  // Gemini: open manually + show toast
  const handleGeminiClick = () => {
    onShowToast?.("Gemini does not support prefilled prompts. Please paste it manually.");
    window.open("https://gemini.google.com/app", '_blank');
  };

  return (
    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">

      
      {/* ChatGPT */}
      <a
        href={chatGptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        {/* ChatGPT icon normal */}
        <img src={chatgptIcon} alt="ChatGPT" className="w-5 h-5 block dark:hidden" />
        {/* ChatGPT icon white in dark mode */}
        <img src={chatgptWhiteIcon} alt="ChatGPT" className="w-5 h-5 hidden dark:block" />
        <span>ChatGPT</span>
      </a>

      {/* Gemini */}
      <button
        onClick={handleGeminiClick}
        className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <img src={geminiIcon} alt="Gemini" className="w-5 h-5" />
        <span>Gemini</span>
      </button>

      {/* Copilot */}
      <a
        href={copilotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <img src={copilotIcon} alt="Copilot" className="w-5 h-5" />
        <span>Copilot</span>
      </a>

    </div>
  );
}
