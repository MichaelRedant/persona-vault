import { useState, useMemo, useEffect } from 'react';
import { FiEdit, FiTrash2, FiLink, FiX } from 'react-icons/fi';

export default function TagManagerModal({
  isOpen,
  onClose,
  personas = [],
  prompts = [],
  onUpdateTags
}) {
  const [selectedTag, setSelectedTag] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [mergeTargetTag, setMergeTargetTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visible, setVisible] = useState(false);

  // Bereken unieke tags met counts
  const allTagsWithCount = useMemo(() => {
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
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [personas, prompts]);

  // Filter op basis van search
  const filteredTags = useMemo(() =>
    allTagsWithCount.filter(({ tag }) =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allTagsWithCount, searchTerm]);

  // Bij openen → fade-in
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    }
  }, [isOpen]);

  // Bij sluiten → delay voor fade-out
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      setSelectedTag('');
      setNewTagName('');
      setMergeTargetTag('');
      setSearchTerm('');
    }, 150);
  };

  // Acties
  const handleRename = () => {
    if (selectedTag && newTagName.trim()) {
      onUpdateTags('rename', { oldTag: selectedTag, newTag: newTagName.trim() });
    }
  };
  const handleDelete = () => {
    if (selectedTag) {
      onUpdateTags('delete', { tag: selectedTag });
    }
  };
  const handleMerge = () => {
    if (selectedTag && mergeTargetTag) {
      onUpdateTags('merge', { sourceTag: selectedTag, targetTag: mergeTargetTag });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FiX className="text-xl" />
        </button>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Tags
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {allTagsWithCount.length} tags
            </span>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tags..."
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          {/* Select Tag */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Tag
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">-- Select tag --</option>
              {filteredTags.map(({ tag, count }) => (
                <option key={tag} value={tag}>
                  {tag} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Rename */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              New tag name
            </label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Merge */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Merge Into
            </label>
            <select
              value={mergeTargetTag}
              onChange={(e) => setMergeTargetTag(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">-- Select target tag --</option>
              {filteredTags
                .filter(({ tag }) => tag !== selectedTag)
                .map(({ tag, count }) => (
                  <option key={tag} value={tag}>
                    {tag} ({count})
                  </option>
                ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-600 mt-4">
            <button
              onClick={handleRename}
              disabled={!selectedTag || !newTagName.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <FiEdit />
              <span>Rename</span>
            </button>

            <button
              onClick={handleDelete}
              disabled={!selectedTag}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
            >
              <FiTrash2 />
              <span>Delete</span>
            </button>

            <button
              onClick={handleMerge}
              disabled={!selectedTag || !mergeTargetTag}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <FiLink />
              <span>Merge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
