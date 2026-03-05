import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FiCopy, FiFileText, FiUploadCloud, FiUsers } from 'react-icons/fi';
import Button from '../components/Button';
import Footer from '../components/Footer';
import Header from '../components/Header';
import StatePanel from '../components/StatePanel';
import { htmlToPlainText, sanitizeRichHtml } from '../utils/sanitizeHtml';

function fallbackPermissions(scope) {
  const normalized = String(scope || 'read').toLowerCase();
  return {
    can_read: true,
    can_comment: normalized === 'comment' || normalized === 'clone',
    can_clone: normalized === 'clone',
  };
}

function noteKey(type, id) {
  return `${type}-${id}`;
}

export default function SharedWorkspace() {
  const { token: shareToken } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personas');
  const [username, setUsername] = useState('');
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [notes, setNotes] = useState({});

  useEffect(() => {
    let active = true;

    const loadSharedWorkspace = async () => {
      setLoading(true);
      setError('');

      const jwt = localStorage.getItem('vault_jwt_token');
      if (!jwt) {
        navigate('/?register=1', { replace: true });
        return;
      }

      try {
        const decoded = jwtDecode(jwt);
        if (!active) return;
        setUsername(decoded.username || decoded.email || '');

        const storedWorkspace = Number.parseInt(localStorage.getItem('vault_activeWorkspaceId') || '', 10);
        if (Number.isFinite(storedWorkspace) && storedWorkspace > 0) {
          setCurrentWorkspaceId(storedWorkspace);
        } else if (decoded.workspace_id) {
          setCurrentWorkspaceId(Number(decoded.workspace_id));
        }
      } catch {
        if (active) {
          setError('Invalid session token');
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/workspaces_share_get.php?token=${shareToken}`
        );
        const result = await response.json();
        if (!active) return;

        if (result.success) {
          setData(result);
        } else {
          setError(result.message || 'Failed to load workspace');
        }
      } catch {
        if (active) {
          setError('Failed to load workspace');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSharedWorkspace();

    return () => {
      active = false;
    };
  }, [shareToken, navigate]);

  const shareScope = String(data?.share_scope || 'read').toLowerCase();
  const permissions = data?.permissions || fallbackPermissions(shareScope);
  const canComment = Boolean(permissions.can_comment);
  const canClone = Boolean(permissions.can_clone);

  useEffect(() => {
    if (!canComment) {
      setNotes({});
      return;
    }

    const raw = localStorage.getItem(`vault_share_notes_${shareToken}`);
    if (!raw) {
      setNotes({});
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setNotes(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setNotes({});
    }
  }, [canComment, shareToken]);

  useEffect(() => {
    if (!canComment) {
      return;
    }

    localStorage.setItem(`vault_share_notes_${shareToken}`, JSON.stringify(notes));
  }, [canComment, shareToken, notes]);

  const handleLogout = () => {
    localStorage.removeItem('vault_jwt_token');
    navigate('/', { replace: true });
  };

  const filteredPersonas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const personas = Array.isArray(data?.personas) ? data.personas : [];

    return personas.filter((persona) => {
      const personaText = htmlToPlainText(persona.description || '').toLowerCase();
      return (
        String(persona.name || '').toLowerCase().includes(term) ||
        personaText.includes(term)
      );
    });
  }, [data?.personas, searchTerm]);

  const filteredPrompts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const prompts = Array.isArray(data?.prompts) ? data.prompts : [];

    return prompts.filter((prompt) => {
      const promptText = htmlToPlainText(prompt.content || '').toLowerCase();
      return (
        String(prompt.title || '').toLowerCase().includes(term) ||
        promptText.includes(term)
      );
    });
  }, [data?.prompts, searchTerm]);

  const clonePersona = async (persona) => {
    if (!canClone) {
      setActionMessage('This share link does not allow cloning.');
      return;
    }

    if (!currentWorkspaceId) {
      setActionMessage('No target workspace selected for cloning.');
      return;
    }

    const jwt = localStorage.getItem('vault_jwt_token');
    if (!jwt) {
      setActionMessage('Session expired. Please log in again.');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/personas_create.php?workspace_id=${currentWorkspaceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            name: `${persona.name} (Clone)`,
            description: persona.description || '',
            tags: Array.isArray(persona.tags) ? persona.tags : [],
            collection_ids: [],
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        setActionMessage(result.error || result.message || 'Could not clone persona');
        return;
      }

      setActionMessage(`Persona cloned into workspace ${currentWorkspaceId}.`);
    } catch {
      setActionMessage('Could not clone persona');
    }
  };

  const clonePrompt = async (prompt) => {
    if (!canClone) {
      setActionMessage('This share link does not allow cloning.');
      return;
    }

    if (!currentWorkspaceId) {
      setActionMessage('No target workspace selected for cloning.');
      return;
    }

    const jwt = localStorage.getItem('vault_jwt_token');
    if (!jwt) {
      setActionMessage('Session expired. Please log in again.');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/prompts_create.php?workspace_id=${currentWorkspaceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            title: `${prompt.title} (Clone)`,
            content: prompt.content || '',
            category: prompt.category || '',
            tags: Array.isArray(prompt.tags) ? prompt.tags : [],
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        setActionMessage(result.error || result.message || 'Could not clone prompt');
        return;
      }

      setActionMessage(`Prompt cloned into workspace ${currentWorkspaceId}.`);
    } catch {
      setActionMessage('Could not clone prompt');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <StatePanel
          variant="loading"
          title="Loading shared workspace..."
          description="Fetching shared data."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <StatePanel
          variant="error"
          title="Could not load shared workspace"
          description={error}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <StatePanel
          variant="empty"
          title="No workspace data available"
          description="The shared workspace did not return any content."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pv-page-shell text-gray-900 dark:text-gray-100">
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
        onToggleSidebar={() => {}}
        onShowToast={(msg) => setActionMessage(msg)}
        canEditWorkspace={false}
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold pv-heading">{data.workspace.name}</h1>
            <p className="text-sm pv-subtle">Shared workspace</p>
          </header>

          <section className="pv-panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold pv-heading">Access mode: {shareScope.toUpperCase()}</p>
                <p className="text-xs pv-subtle">
                  {canClone
                    ? 'You can read, add notes, and clone content into your own workspace.'
                    : canComment
                      ? 'You can read and keep private notes in this browser.'
                      : 'You can read shared content only.'}
                </p>
              </div>
              <p className="text-xs pv-subtle">
                Expires: {new Date(data.expires_at).toLocaleString()}
              </p>
            </div>
            {canComment && (
              <p className="mt-2 text-xs pv-subtle">Notes are stored locally in your browser.</p>
            )}
            {actionMessage && (
              <p className="mt-3 rounded-md bg-blue-100/70 dark:bg-blue-900/40 px-3 py-2 text-sm text-blue-800 dark:text-blue-200">
                {actionMessage}
              </p>
            )}
          </section>

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
              <h2 className="text-2xl font-semibold flex items-center gap-2 pv-heading"><FiUsers /> Personas</h2>
              {filteredPersonas.length === 0 ? (
                <StatePanel
                  variant="empty"
                  title="No personas found"
                  description="This shared workspace has no personas matching your filter."
                />
              ) : (
                <div className="grid gap-4">
                  {filteredPersonas.map((persona) => (
                    <div key={persona.id} className="pv-card p-4">
                      <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                        <h3 className="text-lg font-medium pv-heading">{persona.name}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="text-xs px-2 py-1"
                            icon={<FiCopy />}
                            onClick={() => navigator.clipboard.writeText(htmlToPlainText(persona.description || ''))}
                          >
                            Copy
                          </Button>
                          {canClone && (
                            <Button
                              variant="secondary"
                              className="text-xs px-2 py-1"
                              icon={<FiUploadCloud />}
                              onClick={() => clonePersona(persona)}
                            >
                              Clone
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(persona.description || '') }} />

                      {canComment && (
                        <div className="mt-3">
                          <label htmlFor={noteKey('persona', persona.id)} className="block text-xs font-medium pv-subtle mb-1">
                            Private note
                          </label>
                          <textarea
                            id={noteKey('persona', persona.id)}
                            className="pv-input text-sm min-h-[80px]"
                            placeholder="Add your note for this persona..."
                            value={notes[noteKey('persona', persona.id)] || ''}
                            onChange={(event) => {
                              const key = noteKey('persona', persona.id);
                              setNotes((prev) => ({ ...prev, [key]: event.target.value }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'prompts' && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2 pv-heading"><FiFileText /> Prompts</h2>
              {filteredPrompts.length === 0 ? (
                <StatePanel
                  variant="empty"
                  title="No prompts found"
                  description="This shared workspace has no prompts matching your filter."
                />
              ) : (
                <div className="grid gap-4">
                  {filteredPrompts.map((prompt) => (
                    <div key={prompt.id} className="pv-card p-4">
                      <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                        <h3 className="text-lg font-medium pv-heading">{prompt.title}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="text-xs px-2 py-1"
                            icon={<FiCopy />}
                            onClick={() => navigator.clipboard.writeText(htmlToPlainText(prompt.content || ''))}
                          >
                            Copy
                          </Button>
                          {canClone && (
                            <Button
                              variant="secondary"
                              className="text-xs px-2 py-1"
                              icon={<FiUploadCloud />}
                              onClick={() => clonePrompt(prompt)}
                            >
                              Clone
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="text-sm whitespace-pre-wrap">{htmlToPlainText(prompt.content || '')}</div>

                      {canComment && (
                        <div className="mt-3">
                          <label htmlFor={noteKey('prompt', prompt.id)} className="block text-xs font-medium pv-subtle mb-1">
                            Private note
                          </label>
                          <textarea
                            id={noteKey('prompt', prompt.id)}
                            className="pv-input text-sm min-h-[80px]"
                            placeholder="Add your note for this prompt..."
                            value={notes[noteKey('prompt', prompt.id)] || ''}
                            onChange={(event) => {
                              const key = noteKey('prompt', prompt.id);
                              setNotes((prev) => ({ ...prev, [key]: event.target.value }));
                            }}
                          />
                        </div>
                      )}
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
