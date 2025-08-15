export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

const env: SupabaseEnv = {
  url: (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim(),
  anonKey: (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
};

export function getSupabaseEnv(): SupabaseEnv | null {
  if (!env.url || !env.anonKey) {
    console.warn('[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Falling back to mock data.');
    return null;
  }
  return env;
}
