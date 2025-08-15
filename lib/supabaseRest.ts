import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseEnv } from '@/constants/supabaseConfig';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface SupabaseAuthSession {
  access_token: string;
  token_type: 'bearer' | string;
  expires_in?: number;
  refresh_token?: string;
  user?: SupabaseUser;
}

export interface SupabaseUser {
  id: string;
  aud?: string;
  email?: string;
  phone?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

const ACCESS_TOKEN_KEY = 'sb_access_token';
const REFRESH_TOKEN_KEY = 'sb_refresh_token';

export async function setAccessToken(token: string) {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (e) {
    console.warn('[Supabase] Failed to persist access token', e);
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return token;
  } catch (e) {
    console.warn('[Supabase] Failed to read access token', e);
    return null;
  }
}

export async function setRefreshToken(token: string) {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (e) {
    console.warn('[Supabase] Failed to persist refresh token', e);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return token;
  } catch (e) {
    console.warn('[Supabase] Failed to read refresh token', e);
    return null;
  }
}

export async function clearTokens() {
  try {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } catch (e) {
    console.warn('[Supabase] Failed to clear tokens', e);
  }
}

export async function api(path: string, options: FetchOptions = {}) {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error('Supabase env not configured');
  }
  const url = `${env.url}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    apikey: env.anonKey,
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  console.log('[Supabase REST] Request', url, options.method ?? 'GET');
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[Supabase REST] Error', response.status, text);
    throw new Error(text || `Request failed with ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export async function selectTable<T>(table: string, params?: { select?: string; order?: { column: string; ascending?: boolean }; limit?: number; }): Promise<T[]> {
  const env = getSupabaseEnv();
  if (!env) throw new Error('Supabase env not configured');
  const qs: string[] = [];
  if (params?.select) qs.push(`select=${encodeURIComponent(params.select)}`);
  if (params?.order) qs.push(`order=${encodeURIComponent(params.order.column)}.${params.order.ascending === false ? 'desc' : 'asc'}`);
  if (params?.limit) qs.push(`limit=${params.limit}`);
  const path = `/rest/v1/${encodeURIComponent(table)}${qs.length ? `?${qs.join('&')}` : ''}`;
  return api(path);
}

export async function insertInto<T>(table: string, payload: T | T[]): Promise<T[]> {
  const path = `/rest/v1/${encodeURIComponent(table)}`;
  return api(path, { method: 'POST', headers: { Prefer: 'return=representation' }, body: payload });
}

export interface SignUpPayload { email: string; password: string; }

export async function signUpWithEmail(payload: SignUpPayload): Promise<SupabaseAuthSession> {
  const data = await api('/auth/v1/signup', { method: 'POST', body: { email: payload.email, password: payload.password } });
  const session = data as SupabaseAuthSession;
  if (session?.access_token) await setAccessToken(session.access_token);
  if (session?.refresh_token) await setRefreshToken(session.refresh_token);
  return session;
}

export async function signInWithEmail(payload: SignUpPayload): Promise<SupabaseAuthSession> {
  const env = getSupabaseEnv();
  if (!env) throw new Error('Supabase env not configured');
  const url = `${env.url}/auth/v1/token?grant_type=password`;
  console.log('[Supabase Auth] signInWithEmail POST', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: env.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Auth failed ${res.status}`);
  }
  const session = (await res.json()) as SupabaseAuthSession;
  if (session?.access_token) await setAccessToken(session.access_token);
  if (session?.refresh_token) await setRefreshToken(session.refresh_token ?? '');
  return session;
}

export async function signOut(): Promise<void> {
  const env = getSupabaseEnv();
  if (!env) return;
  const token = await getAccessToken();
  if (!token) {
    await clearTokens();
    return;
  }
  const res = await fetch(`${env.url}/auth/v1/logout`, {
    method: 'POST',
    headers: { apikey: env.anonKey, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn('[Supabase Auth] signOut non-ok', res.status, text);
  }
  await clearTokens();
}

export async function getUser(): Promise<SupabaseUser | null> {
  const env = getSupabaseEnv();
  if (!env) return null;
  const token = await getAccessToken();
  if (!token) return null;
  const res = await fetch(`${env.url}/auth/v1/user`, {
    headers: { apikey: env.anonKey, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn('[Supabase Auth] getUser non-ok', res.status, text);
    return null;
  }
  const user = (await res.json()) as SupabaseUser;
  return user;
}
