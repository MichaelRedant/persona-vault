import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function LoginRegister({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login' or 'register'

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Persona Vault</h1>

        {/* Toggle Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setView('login')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              view === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setView('register')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              view === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Forms */}
        {view === 'login' ? (
          <LoginForm onLoginSuccess={onLoginSuccess} />
        ) : (
          <RegisterForm
            onRegisterSuccess={() => {
              setView('login');
            }}
          />
        )}
      </div>
    </div>
  );
}
