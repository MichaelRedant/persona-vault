import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import lightLogo from '/logo-light.svg';
import darkLogo from '/logo-dark.svg';

export default function LoginRegister({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login' of 'register'
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* —— Sidebar (branding) —— */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 bg-blue-600 dark:bg-blue-700 text-white">
          <img src={lightLogo} alt="Persona Vault" className="w-32 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welkom bij Persona Vault</h2>
          <p className="text-center text-sm">
            Beheer je AI-persona’s en prompts in gedeelde werkruimtes.<br/>
            Revisies, rechten en snel delen inbegrepen.
          </p>
        </div>

        {/* —— Form Container —— */}
        <div className="p-8">
          {/* Logo bovenaan */}
          <div className="flex justify-center mb-6">
            <img
              src={lightLogo}
              alt="Persona Vault"
              className="w-24 dark:hidden"
            />
            <img
              src={darkLogo}
              alt="Persona Vault"
              className="w-24 hidden dark:block"
            />
          </div>

          {/* Toggle Login / Register */}
          <div className="flex justify-center space-x-4 mb-6">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  view === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {tab === 'login' ? 'Login' : 'Registreren'}
              </button>
            ))}
          </div>

          {/* Dynamisch Formulier */}
          {view === 'login' ? (
            <LoginForm onLoginSuccess={onLoginSuccess} />
          ) : (
            <RegisterForm
              onRegisterSuccess={() => setView('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
