// src/components/AuthLayout.jsx
export default function AuthLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left promotional side */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div>
          <img src="/logo-light.svg" alt="Persona Vault" className="h-10 mb-8" />
          <h2 className="text-4xl font-bold mb-4">Welkom bij Persona Vault</h2>
          <p className="text-lg opacity-90">Organiseer je AI-persona's en prompts op één plek.</p>
        </div>
        <p className="text-sm opacity-75">&copy; {new Date().getFullYear()} Persona Vault</p>
      </div>

      {/* Auth card */}
      <div className="flex flex-col justify-center items-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="mb-8 flex justify-center">
            <img src="/logo-light.svg" alt="Persona Vault" className="h-10 dark:hidden" />
            <img src="/logo-dark.svg" alt="Persona Vault" className="h-10 hidden dark:block" />
          </div>

          <div className="mb-8 flex rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <button
              onClick={() => onTabChange('login')}
              className={`w-1/2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => onTabChange('register')}
              className={`w-1/2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
