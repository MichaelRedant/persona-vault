// src/components/LoginForm.jsx
import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Toast from './Toast';
import ForgotPasswordModal from './ForgotPasswordModal';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';


export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForgot, setShowForgot] = useState(false);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
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
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Forgot password?
          </button>
        </div>


        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <ForgotPasswordModal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
      />

    </div>
  );
}
