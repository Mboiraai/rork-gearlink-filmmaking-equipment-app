export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const noTrailing = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  return noTrailing;
}

const env: SupabaseEnv = {
  url: normalizeUrl(process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''),
  anonKey: (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
};

export function getSupabaseEnv(): SupabaseEnv | null {
  if (!env.url || !env.anonKey) {
    console.warn('[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Set both in your environment.');
    return null;
  }
  return env;
}

export function assertSupabaseConfigured(): SupabaseEnv {
  const cfg = getSupabaseEnv();
  if (!cfg) {
    throw new Error('Supabase is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return cfg;
}

export function getSupabaseAuthHeaders(): Record<string, string> {
  const cfg = assertSupabaseConfigured();
  return { apikey: cfg.anonKey, 'Content-Type': 'application/json' } as const;
}
