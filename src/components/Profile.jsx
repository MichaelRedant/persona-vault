import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Profile() {
  const navigate = useNavigate();
  const [decodedToken, setDecodedToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vault_jwt_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
      } catch (err) {
        console.error('Invalid token:', err);
        navigate('/');
      }
    } else {
      navigate('/');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vault_jwt_token');
    navigate('/');
  };

  if (loading) return <div className="p-4">Laden...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Profiel</h2>
      {decodedToken ? (
        <div className="space-y-2">
          <p><strong>Gebruiker:</strong> {decodedToken.username || decodedToken.email || 'Onbekend'}</p>
          <p><strong>Geregistreerd op:</strong> {new Date(decodedToken.iat * 1000).toLocaleString()}</p>
          <p><strong>Token verloopt:</strong> {new Date(decodedToken.exp * 1000).toLocaleString()}</p>
          <button onClick={handleLogout} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Logout</button>
        </div>
      ) : (
        <p className="text-red-600">Geen geldige logingegevens gevonden.</p>
      )}
    </div>
  );
}
