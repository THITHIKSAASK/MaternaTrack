const API_BASE = 'http://localhost:5000/api';

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
      error: err.message || 'Network request failed. Is the MaternaTrack server running on port 5000?',
    };
  }
}
