// src/components/ListingCard.jsx
export default function ListingCard({ item, onDownload, onClick }) {
  const price = item.price_cents > 0 ? `€ ${(item.price_cents/100).toFixed(2)}` : 'Free';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition p-3 flex flex-col">
      <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden mb-3">
        {item.cover_url ? (
          <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No cover</div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{item.item_type}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold">{price}</span>
        <button
          className="text-sm px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white"
          onClick={onDownload}
        >
          Download
        </button>
      </div>
      <button className="mt-2 text-xs text-gray-500 hover:underline" onClick={onClick}>
        Details
      </button>
    </div>
  );
}
