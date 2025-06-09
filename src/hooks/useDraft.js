import { useState, useEffect } from 'react';

export default function useDraft(storageKey, initialState) {
  const [draft, setDraft] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialState;
  });

  // Save draft to localStorage whenever draft changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, storageKey]);

  // Clear draft → call on successful save or cancel
  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return [draft, setDraft, clearDraft];
}
