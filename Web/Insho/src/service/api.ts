// Minimal API client for JWT auth
export type User = {
  id: string;
  email: string;
  name?: string | null;
  gender?: string | null;
  activity_level?: string | null;
  is_active: boolean;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: 'bearer' | string;
  user: User;
};

export type DashboardResponse = {
  show_onboarding: boolean;
};

const API_BASE = (import.meta as any).env?.VITE_API_DOMAIN || 'http://localhost:8000';

const TOKEN_KEY = 'insho_access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  // Avoid sending Authorization header for public auth endpoints to reduce CORS preflights
  const isPublicAuth = path.startsWith('/api/v1/auth/login') || path.startsWith('/api/v1/auth/register');
  const token = getToken();
  if (token && !isPublicAuth) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { mode: 'cors', ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let data: any = text;
    try { data = JSON.parse(text); } catch {}
    throw new Error(data?.detail || data?.message || res.statusText);
  }
  return res.json();
}

export async function register(email: string, password: string, name?: string): Promise<User> {
  return request<User>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function me(): Promise<User> {
  // Prefer the dedicated users endpoint if available; fallback to auth/me
  try {
    return await request<User>('/api/v1/users/me');
  } catch {
    return request<User>('/api/v1/auth/me');
  }
}

export async function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/api/v1/dashboard');
}

export async function setOnboarded(is_onboarded: boolean): Promise<User> {
  return request<User>('/api/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ is_onboarded }),
  });
}

export function logout() {
  clearToken();
}
