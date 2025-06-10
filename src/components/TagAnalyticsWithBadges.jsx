import { useMemo } from 'react';

export default function TagAnalyticsWithBadges({ personas = [], prompts = [], topN = 5 }) {
  // Bereken tags met counts
  const topTags = useMemo(() => {
    const tagCounter = {};
    [...personas, ...prompts].forEach(item => {
      (item.tags || []).forEach(tag => {
        if (tag && tag.trim() !== '') {
          tagCounter[tag] = (tagCounter[tag] || 0) + 1;
        }
      });
    });

    return Object.entries(tagCounter)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  }, [personas, prompts, topN]);

  if (topTags.length === 0) return null;

  // Tailwind badge kleuren per index
  const badgeColors = [
    'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900',
    'bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900',
    'bg-purple-100 text-purple-800 dark:bg-purple-200 dark:text-purple-900',
    'bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900'
  ];

  return (
    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        🧠 Top {topN} meest gebruikte tags
      </h3>
      <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
        {topTags.map(({ tag, count }, index) => (
          <li key={tag} className="flex items-center justify-between">
            <span className="flex-1 truncate">{tag}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                badgeColors[index] || 'bg-gray-300 text-gray-800'
              }`}
            >
              {count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
