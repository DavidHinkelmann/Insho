// Minimal API client for JWT auth
export type User = {
  id: string;
  email: string;
  name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: 'bearer' | string;
  user: User;
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
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
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
  return request<User>('/api/v1/auth/me');
}

export function logout() {
  clearToken();
}
