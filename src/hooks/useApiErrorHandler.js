import { useCallback } from 'react';

/**
 * Industry level API error handler → toont nette toast of console error.
 * 
 * @param {Function} showToast - functie om toast te tonen (bv. onShowToast)
 * @returns {Function} handleError → use like: catch(err => handleError(err, 'Saving prompt failed'))
 */
export function useApiErrorHandler(showToast) {
  const handleError = useCallback((err, userMessage = 'An error occurred') => {
    console.error('API error:', err);

    // Fallback error message
    let errorMessage = userMessage;

    // Als het een Response object is → probeer json error message te lezen
    if (err instanceof Response) {
      err.json()
        .then((data) => {
          if (data?.error) {
            errorMessage = `${userMessage}: ${data.error}`;
          }
          showToast?.(errorMessage);
        })
        .catch(() => {
          // fallback als json parsing faalt
          showToast?.(errorMessage);
        });
    } else {
      // standaard error
      showToast?.(errorMessage);
    }
  }, [showToast]);

  return handleError;
}
