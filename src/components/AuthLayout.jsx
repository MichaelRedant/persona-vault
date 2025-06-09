// src/components/AuthLayout.jsx
export default function AuthLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gradient-to-b from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white px-4">

      <h1 className="text-4xl font-bold mb-6">Persona Vault</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => onTabChange('login')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === 'login'
              ? 'bg-blue-600 text-white scale-105 shadow-md'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
          }`}
        >
          Login
        </button>

        <button
          onClick={() => onTabChange('register')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === 'register'
              ? 'bg-blue-600 text-white scale-105 shadow-md'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
          }`}
        >
          Register
        </button>
      </div>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
