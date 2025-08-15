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
  user?: unknown;
}

const ACCESS_TOKEN_KEY = 'sb_access_token';

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
