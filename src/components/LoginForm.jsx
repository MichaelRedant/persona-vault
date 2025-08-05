// src/components/LoginForm.jsx
import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Toast from './Toast';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/auth_login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save token to localStorage
        localStorage.setItem('vault_jwt_token', data.token.trim());

        onLoginSuccess(data.token);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">Login</h2>

        {error && <Toast message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <Input
            label="Email or Username"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={8}
            required
          />

          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Forgot password?
            </a>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
