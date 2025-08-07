import lightLogo from '/logo-light.svg';
import darkLogo from '/logo-dark.svg';

export default function AuthLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">

      {/* —— Linkerkant: promo verticaal gecentreerd —— */}
      <div className="hidden md:flex flex-col p-12
                      bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500
                      text-white">
        {/* Deze wrapper centreert verticaal */}
        <div className="flex-1 flex flex-col justify-center">
          {/* <img src={lightLogo} alt="Persona Vault" className="h-12 mb-6" /> */}
          <h2 className="text-5xl font-extrabold leading-tight mb-4">
            Welkom bij <br/> Persona Vault
          </h2>
          <p className="text-lg opacity-90 max-w-sm">
            Organiseer en deel je AI-persona’s en prompts in een veilige, gedeelde workspace.
          </p>
        </div>
        {/* Bottom copyright blijft onderaan */}
        <p className="pt-4 text-sm opacity-75">
          &copy; {new Date().getFullYear()} Persona Vault
        </p>
      </div>

      {/* —— Rechterkant: auth card —— */}
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-10">
          {/* Logo + tabs + children blijven ongewijzigd */}
          <div className="mb-8 flex justify-center">
            <img src={lightLogo} alt="Persona Vault" className="h-10 dark:hidden" />
            <img src={darkLogo} alt="Persona Vault" className="h-10 hidden dark:block" />
          </div>
          <div className="mb-8 flex rounded-full overflow-hidden
                          bg-gray-100 dark:bg-gray-700">
            {/* toggle buttons */}
            {['login','register'].map(tab => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex-1 py-2 text-sm font-medium transition
                  ${activeTab === tab
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {tab === 'login' ? 'Login' : 'Registreren'}
              </button>
            ))}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
