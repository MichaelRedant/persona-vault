import { useEffect, useId, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

export default function CardActionsDropdown({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (!open) {
      return undefined;
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const card = dropdownRef.current?.closest('.card-container');
    if (card) {
      card.style.zIndex = open ? '50' : '';
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const firstButton = menuRef.current?.querySelector('button');
    firstButton?.focus();
  }, [open]);

  const moveFocus = (direction) => {
    const items = Array.from(menuRef.current?.querySelectorAll('button') || []);
    if (items.length === 0) return;

    const activeIndex = items.findIndex((item) => item === document.activeElement);
    const nextIndex = direction === 'next'
      ? (activeIndex + 1) % items.length
      : (activeIndex - 1 + items.length) % items.length;
    items[nextIndex].focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Open card actions"
        title="More actions"
        className="text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      >
        <FiMoreVertical className="text-xl" />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label="Card actions"
          className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-2 space-y-1"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              triggerRef.current?.focus();
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              moveFocus('next');
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              moveFocus('previous');
            } else if (event.key === 'Home') {
              event.preventDefault();
              const first = menuRef.current?.querySelector('button');
              first?.focus();
            } else if (event.key === 'End') {
              event.preventDefault();
              const items = Array.from(menuRef.current?.querySelectorAll('button') || []);
              items[items.length - 1]?.focus();
            }
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation();
                action.onClick();
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${action.danger ? 'text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800' : ''}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
