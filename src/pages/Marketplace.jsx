// src/pages/Marketplace.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Header from '../components/Header';
import ListingCard from '../components/ListingCard';
import ListingManageModal from '../components/ListingManageModal';
import { useMarketplaceApi } from '../hooks/useMarketplaceApi';

const PLACEHOLDER = '/logo-512.png'; // fallback als geen cover_url

export default function Marketplace({ token }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [manageOpen, setManageOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const didInit = useRef(false);

  const {
    searchListings,
    trackDownload,
    uploadFile,
    createListing,
    updateListing,
    deleteListing,
  } = useMarketplaceApi(token);

  const mapCovers = (data) =>
    data.map(d => ({
      ...d,
      cover_url: d.cover_url || PLACEHOLDER,
      is_owner: d.is_owner, // indien backend dit meegeeft
    }));

  const load = useCallback(async (query = q) => {
    const data = await searchListings({ q: query, limit: 24, sort: 'recent' });
    setItems(mapCovers(data));
  }, [q, searchListings]);

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setIsAdmin(!!decoded.is_admin);
    } catch {
      setIsAdmin(false);
    }
  }, [token]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    load(); // initial fetch one time
  }, [load]);

  return (
    <>
      <Header
        personas={[]}
        prompts={[]}
        searchTerm={q}
        setSearchTerm={setQ}
        username=""
        onOpenProfile={() => {}}
        createPersona={() => {}}
        createPrompt={() => {}}
        fetchPersonas={() => {}}
        fetchPrompts={() => {}}
        deletePersona={() => {}}
        deletePrompt={() => {}}
        handleUpdateTags={() => {}}
        onLogout={() => {
          localStorage.removeItem('vault_jwt_token');
          window.location.href = '/vault';
        }}
        isAdmin={isAdmin}
        onOpenAdminPanel={() => {}}
        onToggleSidebar={() => {}}
      />

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">Marketplace</h1>
            <Link to="/" className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
              Back to Workspace
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search listings..."
              className="flex-1 px-4 py-2 rounded-full border border-indigo-300 bg-white dark:bg-gray-800 text-sm"
            />
            <button
              className="px-4 py-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={() => load(q)}
            >
              Search
            </button>
            <button
              className="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600"
              onClick={() => { setEditing(null); setManageOpen(true); }}
            >
              + New Listing
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((it) => (
              <ListingCard
                key={it.id}
                item={it}
                canManage={it.is_owner || isAdmin}
                onDownload={async () => {
                  await trackDownload(it.id);
                  if (it.file_url) window.open(it.file_url, '_blank', 'noopener');
                }}
                onClick={() => alert('TODO: listing details')}
                onEdit={() => { setEditing(it); setManageOpen(true); }}
                onDelete={async () => {
                  if (confirm('Delete this listing?')) {
                    await deleteListing(it.id);
                    await load();
                  }
                }}
              />
            ))}
          </div>

          <ListingManageModal
            open={manageOpen}
            onClose={() => setManageOpen(false)}
            initial={editing}
            uploadFn={uploadFile}
            onSave={async (payload) => {
              if (payload.id) {
                await updateListing(payload);
              } else {
                await createListing({
                  ...payload,
                  item_id: 1,          // TODO: kies persona/prompt id via picker
                  currency: 'EUR',
                  visibility: 'public',
                  tags: payload.tags || '',
                });
              }
              setManageOpen(false);
              await load();
            }}
            onDelete={async (id) => {
              await deleteListing(id);
              setManageOpen(false);
              await load();
            }}
          />
        </div>
      </main>
    </>
  );
}
