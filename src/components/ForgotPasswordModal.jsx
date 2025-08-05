import { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import Toast from './Toast';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${BASE_URL}/auth_forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setMessage(
        'If an account with that email exists, a reset link has been sent.'
      );
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

      {message && <Toast message={message} onClose={() => setMessage(null)} />}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </Modal>
  );
}

