import { useState, useEffect, useCallback } from 'react';
import { useApiErrorHandler } from './useApiErrorHandler';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/persona-vault-web/api';

export function usePersonasApi(token, onShowToast) {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useApiErrorHandler(onShowToast);

  const parsePersonas = (data) =>
  data.map((p) => ({
    ...p,
    favorite: p.favorite === 1 || p.favorite === '1' ? 1 : 0,
    collectionIds:
  Array.isArray(p.collection_ids) ? p.collection_ids.map(Number)
  : Array.isArray(p.collectionIds) ? p.collectionIds.map(Number)
  : [],
  }));

  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/personas_get.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
  setPersonas(parsePersonas(data));
} else {
  setPersonas([]);
  handleError(new Error('Invalid API response'), 'Failed to fetch personas');
}
    } catch (err) {
      console.error('Failed to fetch personas:', err);
      setError(err);
      setPersonas([]);
      handleError(err, 'Failed to fetch personas');
    } finally {
      setLoading(false);
    }
  }, [handleError, token]);

  const createPersona = async (name, description, tags = [], collectionIds = []) => {
  try {
    const response = await fetch(`${BASE_URL}/personas_create.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, tags, collection_ids: collectionIds })
    });

    const data = await response.json();
    if (data.success) {
      await fetchPersonas();
    } else {
      handleError(new Error('API returned failure'), 'Failed to create persona');
    }
  } catch (err) {
    console.error('Failed to create persona:', err);
    setError(err);
    handleError(err, 'Failed to create persona');
  }
};




  const updatePersona = async (id, name, description, tags = [], collectionIds = []) => {
  try {
    const response = await fetch(`${BASE_URL}/personas_update.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, name, description, tags, collectionIds }), // ✅ array
    });
    const data = await response.json();
    if (data.success) {
      await fetchPersonas();
    } else {
      handleError(new Error('API returned failure'), 'Failed to update persona');
    }
  } catch (err) {
    console.error('Failed to update persona:', err);
    setError(err);
    handleError(err, 'Failed to update persona');
  }
};



  const updatePersonaFavorite = async (id, favorite) => {
  try {
    const response = await fetch(`${BASE_URL}/personas_update_favorite.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, favorite }),
    });
    const data = await response.json();
    if (data.success) {
      setPersonas((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                favorite,
                collection_id:
                  p.collection_id === null || p.collection_id === undefined
                    ? null
                    : Number(p.collection_id), // industry correct → behouden
              }
            : p
        )
      );
    } else {
      handleError(new Error('API returned failure'), 'Failed to update favorite');
    }
  } catch (err) {
    console.error('Failed to update persona favorite:', err);
    setError(err);
    handleError(err, 'Failed to update favorite');
  }
};

const removePersonaFromCollection = async (personaId, collectionId) => {
  try {
    const response = await fetch(`${BASE_URL}/persona_remove_from_collection.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ personaId, collectionId }),
    });
    const data = await response.json();
    if (data.success) {
      await fetchPersonas();
    } else {
      handleError(new Error('API returned failure'), 'Failed to remove from collection');
    }
  } catch (err) {
    console.error('Error removing from collection:', err);
    setError(err);
    handleError(err, 'Failed to remove from collection');
  }
};


  const deletePersona = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/personas_delete.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPersonas((prev) => prev.filter((p) => p.id !== id));
      } else {
        handleError(new Error('API returned failure'), 'Failed to delete persona');
      }
    } catch (err) {
      console.error('Failed to delete persona:', err);
      setError(err);
      handleError(err, 'Failed to delete persona');
    }
  };

  useEffect(() => {
  if (token && typeof token === 'string' && token.length > 100 && token.startsWith('eyJ')) {
    console.log('usePersonasApi → Valid token → fetching personas');
    fetchPersonas();
  } else {
    console.log('usePersonasApi → No valid token → skipping personas fetch');
  }
}, [fetchPersonas, token]);


  

  return {
    personas,
    setPersonas,
    loading,
    error,
    fetchPersonas,
    createPersona,
    updatePersona,
    updatePersonaFavorite,
    deletePersona,
    removePersonaFromCollection,

  };
}
