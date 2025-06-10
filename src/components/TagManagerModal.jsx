import { FiEdit, FiTrash2, FiLink } from 'react-icons/fi';

export default function TagManagerModal({
  isOpen,
  onClose,
  allTags = [],
  selectedTag,
  setSelectedTag,
  newTagName,
  setNewTagName,
  mergeTargetTag,
  setMergeTargetTag,
  onRenameTag,
  onDeleteTag,
  onMergeTags
}) {
  if (!isOpen) return null;

  return (
    <div className="flex flex-col max-h-[80vh] overflow-y-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Manage Tags
      </h2>

      {/* Tag selector */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Tag
        </label>
        <select
          value={selectedTag || ''}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">-- Select tag --</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
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
          value={mergeTargetTag || ''}
          onChange={(e) => setMergeTargetTag(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">-- Select target tag --</option>
          {allTags
            .filter((tag) => tag !== selectedTag)
            .map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-600 mt-4">
        <button
          onClick={onRenameTag}
          disabled={!selectedTag || !newTagName.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <FiEdit />
          <span>Rename</span>
        </button>

        <button
          onClick={onDeleteTag}
          disabled={!selectedTag}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
        >
          <FiTrash2 />
          <span>Delete</span>
        </button>

        <button
          onClick={onMergeTags}
          disabled={!selectedTag || !mergeTargetTag}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <FiLink />
          <span>Merge</span>
        </button>

        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition ml-auto"
        >
          ✖️
          <span>Close</span>
        </button>
      </div>
    </div>
  );
}
