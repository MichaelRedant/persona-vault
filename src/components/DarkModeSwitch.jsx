// src/components/DarkModeSwitch.jsx
import { useEffect, useState, useCallback } from 'react';

export default function DarkModeSwitch() {
  const getInitial = () => {
    const raw = localStorage.getItem('darkMode');
    if (raw !== null) return JSON.parse(raw);
    // default to system preference
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  };

  const [darkMode, setDarkMode] = useState(getInitial);

  const apply = useCallback((isDark) => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, []);

  useEffect(() => {
    apply(darkMode);
  }, [darkMode, apply]);

  // luister naar OS theme wijzigingen (alleen als user niets expliciet koos)
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = (e) => {
      const stored = localStorage.getItem('darkMode');
      if (stored === null) setDarkMode(e.matches);
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  // sync tussen tabs/vensters
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'darkMode' && e.newValue != null) {
        const v = JSON.parse(e.newValue);
        setDarkMode(v);
        apply(v);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [apply]);

  return (
    <button
      type="button"
      onClick={() => setDarkMode((v) => !v)}
      className="text-xl px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-pressed={darkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {darkMode ? '🌙' : '🌞'}
    </button>
  );
}
