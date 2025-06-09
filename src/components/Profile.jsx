// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Profile() {
  const navigate = useNavigate();
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('vault_jwt_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
      } catch (err) {
        console.error('Invalid token:', err);
        navigate('/'); // if token invalid → go back to login
      }
    } else {
      navigate('/'); // not logged in → back to login
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vault_jwt_token');
    navigate('/'); // go back to login after logout
  };

  function getGreeting() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) return '🌅 Good morning';
    if (hour >= 12 && hour < 17) return '☀️ Good afternoon';
    if (hour >= 17 && hour < 21) return '🌇 Good evening';
    return '🌙 Good night';
  }

  if (!decodedToken) return null; // loading state (can be enhanced)

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-500 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">{getGreeting()}, {decodedToken.username || decodedToken.email}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to your profile page. Here is your account info:</p>

        <div className="text-left space-y-2">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Username:</span>{' '}
            <span className="text-gray-900 dark:text-gray-100">{decodedToken.username || '-'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>{' '}
            <span className="text-gray-900 dark:text-gray-100">{decodedToken.email || '-'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full px-4 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
