import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SharedWorkspace() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces_share_get.php?token=${token}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result);
        } else {
          setError(result.message || 'Failed to load workspace');
        }
      })
      .catch(() => setError('Failed to load workspace'));
  }, [token]);

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <main className="max-w-screen-md mx-auto p-4 text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-4">{data.workspace.name}</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Personas</h2>
        {data.personas.length === 0 && <p className="text-sm text-gray-500">No personas</p>}
        {data.personas.map(p => (
          <div key={p.id} className="bg-white dark:bg-gray-800 rounded p-3 mb-3 shadow">
            <div className="flex justify-between items-start">
              <h3 className="font-medium mr-2">{p.name}</h3>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => navigator.clipboard.writeText(p.description)}
              >
                Copy
              </button>
            </div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: p.description }} />
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Prompts</h2>
        {data.prompts.length === 0 && <p className="text-sm text-gray-500">No prompts</p>}
        {data.prompts.map(pr => (
          <div key={pr.id} className="bg-white dark:bg-gray-800 rounded p-3 mb-3 shadow">
            <div className="flex justify-between items-start">
              <h3 className="font-medium mr-2">{pr.title}</h3>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => navigator.clipboard.writeText(pr.content)}
              >
                Copy
              </button>
            </div>
            <div className="text-sm whitespace-pre-wrap">{pr.content}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
