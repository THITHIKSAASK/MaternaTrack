function getApiBase(): string {
  // 1. Explicit environment variable configured in Vercel or .env
  if (import.meta.env.VITE_API_URL) {
    const raw = (import.meta.env.VITE_API_URL as string).replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  // 2. Browser runtime detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development defaults to port 5000 Express backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // In production on Vercel, use relative /api for unified deployment (avoids CORS & cross-origin issues)
    return '/api';
  }

  // 3. Fallback
  return 'https://materna-track-73el.vercel.app/api';
}

const API_BASE = getApiBase();

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string; pagination?: any }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
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
      credentials: 'include', // send cookies
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('API Error:', err);
    return {
      success: false,
      error: err.message || 'Network request failed. Is the MaternaTrack server running?',
    };
  }
}
