import { useCallback } from 'react';
import { ApiClientError } from '../api/client';

export function useApiErrorHandler(showToast) {
  const handleError = useCallback((err, userMessage = 'An error occurred') => {
    let detail = '';
    if (err instanceof ApiClientError) {
      detail = err.message;
    } else if (err instanceof Error) {
      detail = err.message;
    } else if (typeof err === 'string') {
      detail = err;
    }

    const message = detail ? `${userMessage}: ${detail}` : userMessage;
    showToast?.(message);
  }, [showToast]);

  return handleError;
}
