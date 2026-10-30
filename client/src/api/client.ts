function getApiBase(): string {
  // 1. Explicit environment variable configured in Vercel or .env (e.g. VITE_API_URL)
  if (import.meta.env.VITE_API_URL) {
    const raw = (import.meta.env.VITE_API_URL as string).trim().replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  // 2. Local development detection (Vite dev server on localhost or 127.0.0.1)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  // 3. Production backend deployment URL
  return 'https://materna-track-73el.vercel.app/api';
}

const API_BASE = getApiBase();

/**
 * Builds a clean, fully-qualified API URL without missing or duplicate /api prefixes.
 */
export function getCleanApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanBase = API_BASE.replace(/\/+$/, '');
  let cleanPath = endpoint;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.slice(4);
  } else if (cleanPath === '/api') {
    cleanPath = '';
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string; pagination?: any }> {
  const url = getCleanApiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  // Add stored token if present in localStorage as backup to cookie
  const token = localStorage.getItem('maternatrack_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // send cookies cross-origin
    });

    const contentType = res.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          success: res.ok,
          error: !res.ok ? `Server error (${res.status}): ${res.statusText || 'Non-JSON response'}` : undefined,
          message: text,
        };
      }
    }

    if (!res.ok && !data.error) {
      data.error = `HTTP ${res.status}: ${res.statusText || 'Request failed'}`;
    }

    return data;
  } catch (err: any) {
    console.error(`[MaternaTrack API] Error requesting ${url}:`, err);

    let friendlyError = err?.message || 'Network request failed.';
    if (friendlyError === 'Failed to fetch' || friendlyError.toLowerCase().includes('fetch')) {
      friendlyError = `Cannot connect to MaternaTrack API at ${API_BASE}. Please verify that the backend is online and CORS is configured.`;
    }

    return {
      success: false,
      error: friendlyError,
    };
  }
}
