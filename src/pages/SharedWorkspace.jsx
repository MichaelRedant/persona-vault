import { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Button from '../components/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personas');
  const [username, setUsername] = useState('');

  useEffect(() => {

    const jwt = localStorage.getItem('vault_jwt_token');
    if (!jwt) {
      navigate('/?register=1', { replace: true });
      return;
    }


    try {
      const decoded = jwtDecode(jwt);
      setUsername(decoded.username || decoded.email || '');
    } catch (e) {
      console.error('Failed to decode token', e);
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

  const handleLogout = () => {
    localStorage.removeItem('vault_jwt_token');
    navigate('/', { replace: true });
  };


  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const filteredPersonas = data.personas.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPrompts = data.prompts.filter(
    pr =>
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        personas={data.personas}
        prompts={data.prompts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        username={username}
        onOpenProfile={() => {}}
        createPersona={() => {}}
        createPrompt={() => {}}
        fetchPersonas={() => {}}
        fetchPrompts={() => {}}
        deletePersona={() => {}}
        deletePrompt={() => {}}
        handleUpdateTags={() => {}}
        onLogout={handleLogout}
        isAdmin={false}
        onOpenAdminPanel={() => {}}
      />

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold">{data.workspace.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shared workspace</p>
          </header>

          <nav className="flex justify-center gap-4">
            <Button
              variant={activeTab === 'personas' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('personas')}
            >
              Personas
            </Button>
            <Button
              variant={activeTab === 'prompts' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('prompts')}
            >
              Prompts
            </Button>
          </nav>

          {activeTab === 'personas' && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2"><FiUsers /> Personas</h2>
              {filteredPersonas.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No personas found</p>
              ) : (
                <div className="grid gap-4">
                  {filteredPersonas.map(p => (
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
          )}

          {activeTab === 'prompts' && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2"><FiFileText /> Prompts</h2>
              {filteredPrompts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No prompts found</p>
              ) : (
                <div className="grid gap-4">
                  {filteredPrompts.map(pr => (
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
          )}
        </div>
      </main>

      <Footer
        username={username}
        personasCount={data.personas.length}
        promptsCount={data.prompts.length}
        onOpenSettings={() => {}}
      />
    </div>

  );
}
