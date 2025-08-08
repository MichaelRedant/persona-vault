// src/pages/Marketplace.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import UploadModal from '../components/UploadModal';
import Header from '../components/Header';
import { useMarketplaceApi } from '../hooks/useMarketplaceApi';

export default function Marketplace({ token }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [openUpload, setOpenUpload] = useState(false);

  const { searchListings, trackDownload, uploadFile, createListing } = useMarketplaceApi(token);

  const load = useCallback(async () => {
    const data = await searchListings({ q, limit: 24, sort: 'recent' });
    const mapped = data.map(d => ({
      ...d,
      cover_url: d.cover_file_id ? `${window.location.origin}/uploads/seed/cover-persona-starter.png` : null
    }));
    setItems(mapped);
  }, [q, searchListings]);

  useEffect(() => {
    load();
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
        isAdmin={false}
        onOpenAdminPanel={() => {}}
        onToggleSidebar={() => {}}
      />
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-indigo-700">Marketplace</h1>
            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Back to Workspace
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Search listings..."
              className="flex-1 px-4 py-2 rounded-full border border-indigo-300 bg-white dark:bg-gray-800 text-sm"
            />
            <button
              className="px-4 py-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={load}
            >
              Search
            </button>
            <button
              className="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600"
              onClick={()=>setOpenUpload(true)}
            >
              + New Listing
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(it => (
              <ListingCard
                key={it.id}
                item={it}
                onDownload={async () => {
                  await trackDownload(it.id);
                  if (it.file_url) window.open(it.file_url, '_blank');
                }}
                onClick={()=> alert('TODO: listing details')}
              />
            ))}
          </div>

          {/* Upload -> na upload meteen een listing aanmaken (demo flow) */}
          <UploadModal
            open={openUpload}
            onClose={()=>setOpenUpload(false)}
            uploadFn={uploadFile}
            onUploaded={async ({ file_id }) => {
              const id = await createListing({
                item_type: 'persona',
                item_id: 1, // demo; later picker
                title: 'New Demo Listing',
                description: 'Uploaded via modal',
                price_cents: 0,
                currency: 'EUR',
                visibility: 'public',
                tags: 'demo,upload',
                cover_file_id: file_id
              });
              setOpenUpload(false);
              await load();
              alert('Listing created: ' + id);
            }}
          />
        </div>
      </main>
    </>
  );
}

