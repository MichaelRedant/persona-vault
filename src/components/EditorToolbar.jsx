import React, { useState } from 'react';
import { FiRotateCcw, FiRotateCw, FiLink } from 'react-icons/fi';

export default function EditorToolbar({ editor }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [savedSelection, setSavedSelection] = useState(null);

  if (!editor) {
    return null;
  }

  const buttonBaseClasses = 'px-2 py-1 rounded-md border text-sm font-medium transition-colors duration-150';
  const buttonActiveClasses = 'bg-blue-600 text-white border-blue-600';
  const buttonInactiveClasses = 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600';

  const getButtonClass = (isActive) =>
    `${buttonBaseClasses} ${isActive ? buttonActiveClasses : buttonInactiveClasses}`;

  const handleAddLink = () => {
    setShowLinkInput(true);
    setLinkUrl(editor.getAttributes('link').href || '');
    setSavedSelection(editor.state.selection);
  };

  const applyLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      if (savedSelection && !savedSelection.empty) {
        editor.view.dispatch(editor.state.tr.setSelection(savedSelection));
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      } else {
        editor.chain().focus().insertContent(
          `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>`
        ).run();
      }
    }
    setShowLinkInput(false);
    setLinkUrl('');
    setSavedSelection(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-2">

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={getButtonClass(editor.isActive('bold'))}
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={getButtonClass(editor.isActive('italic'))}
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={getButtonClass(editor.isActive('underline'))}
        >
          U
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={getButtonClass(editor.isActive('strike'))}
        >
          S
        </button>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={getButtonClass(editor.isActive('heading', { level: 1 }))}
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={getButtonClass(editor.isActive('heading', { level: 2 }))}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={getButtonClass(editor.isActive('heading', { level: 3 }))}
        >
          H3
        </button>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={getButtonClass(editor.isActive('bulletList'))}
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={getButtonClass(editor.isActive('orderedList'))}
        >
          1. List
        </button>

        {/* CodeBlock */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={getButtonClass(editor.isActive('codeBlock'))}
        >
          {'</>'}
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={getButtonClass(editor.isActive('blockquote'))}
        >
          "
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={getButtonClass(false)}
        >
          ―
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={handleAddLink}
          className={getButtonClass(editor.isActive('link'))}
        >
          <FiLink className="w-4 h-4" />
        </button>

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={getButtonClass(false)}
        >
          <FiRotateCcw className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={getButtonClass(false)}
        >
          <FiRotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Link Input Field */}
      {showLinkInput && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="url"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={applyLink}
            className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
              setSavedSelection(null);
            }}
            className="px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
