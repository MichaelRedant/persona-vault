const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 1;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/vault/api').replace(/\/$/, '');

export class ApiClientError extends Error {
  constructor(message, { status = 0, data = null, endpoint = '' } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
    this.endpoint = endpoint;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(endpoint, params) {
  const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '');
  const absoluteBase = /^https?:\/\//i.test(API_BASE_URL);
  const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = absoluteBase
    ? new URL(`${API_BASE_URL}/${cleanEndpoint}`)
    : new URL(`${API_BASE_URL}/${cleanEndpoint}`, fallbackOrigin);

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function parseResponseBody(response) {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload, fallback = 'Request failed') {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload.message === 'string' && payload.message.trim() !== '') {
    return payload.message;
  }

  if (typeof payload.error === 'string' && payload.error.trim() !== '') {
    return payload.error;
  }

  return fallback;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    token,
    headers = {},
    body,
    params,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    signal,
  } = options;

  const url = buildUrl(endpoint, params);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const requestHeaders = { Accept: 'application/json', ...headers };
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      let payload = body;
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      if (body !== undefined && body !== null && !isFormData) {
        const hasContentType = Object.keys(requestHeaders).some(
          (key) => key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          requestHeaders['Content-Type'] = 'application/json';
        }
        if (typeof body !== 'string') {
          payload = JSON.stringify(body);
        }
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: payload,
        signal: signal || controller.signal,
      });

      const parsed = await parseResponseBody(response);

      if (!response.ok) {
        if (RETRYABLE_STATUSES.has(response.status) && attempt < retries) {
          await sleep(300 * (attempt + 1));
          continue;
        }

        throw new ApiClientError(
          getErrorMessage(parsed, `HTTP ${response.status}`),
          { status: response.status, data: parsed, endpoint: url }
        );
      }

      return parsed;
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      const retryable = aborted || error instanceof TypeError;

      if ((retryable && attempt < retries)) {
        await sleep(300 * (attempt + 1));
        continue;
      }

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (aborted) {
        throw new ApiClientError('Request timeout', { endpoint: url });
      }

      throw new ApiClientError(error?.message || 'Network request failed', { endpoint: url });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new ApiClientError('Request failed', { endpoint: url });
}
