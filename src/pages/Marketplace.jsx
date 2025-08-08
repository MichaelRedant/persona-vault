// src/pages/Marketplace.jsx
import { useEffect, useState, useCallback } from 'react';
import ListingCard from '../components/ListingCard';
import UploadModal from '../components/UploadModal';
import { useMarketplaceApi } from '../hooks/useMarketplaceApi';

export default function Marketplace({ token }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [openUpload, setOpenUpload] = useState(false);

  const { searchListings, toggleFavorite, uploadFile, createListing } = useMarketplaceApi(token);

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
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search listings..."
            className="px-3 py-2 rounded border bg-white dark:bg-gray-800 text-sm"
          />
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={load}>Search</button>
          <button className="px-3 py-2 rounded border" onClick={()=>setOpenUpload(true)}>+ New Listing</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(it => (
          <ListingCard
            key={it.id}
            item={it}
            onFavorite={async ()=> {
              await toggleFavorite(it.id);
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
    </main>
  );
}
