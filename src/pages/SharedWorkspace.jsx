import { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { FiUsers, FiFileText, FiCopy } from 'react-icons/fi';

export default function SharedWorkspace() {
  const { token: shareToken } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {

    const jwt = localStorage.getItem('vault_jwt_token');
    if (!jwt) {
      navigate('/?register=1', { replace: true });
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces_share_get.php?token=${shareToken}`)

      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result);
        } else {
          setError(result.message || 'Failed to load workspace');
        }
      })
      .catch(() => setError('Failed to load workspace'));

  }, [shareToken, navigate]);

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{data.workspace.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Shared workspace</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2"><FiUsers /> Personas</h2>
          {data.personas.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No personas</p>
          ) : (
            <div className="grid gap-4">
              {data.personas.map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{p.name}</h3>
                    <Button
                      variant="outline"
                      className="text-xs px-2 py-1"
                      icon={<FiCopy />}
                      onClick={() => navigator.clipboard.writeText(p.description)}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: p.description }} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2"><FiFileText /> Prompts</h2>
          {data.prompts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No prompts</p>
          ) : (
            <div className="grid gap-4">
              {data.prompts.map(pr => (
                <div key={pr.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{pr.title}</h3>
                    <Button
                      variant="outline"
                      className="text-xs px-2 py-1"
                      icon={<FiCopy />}
                      onClick={() => navigator.clipboard.writeText(pr.content)}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{pr.content}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

    </main>
  );
}
