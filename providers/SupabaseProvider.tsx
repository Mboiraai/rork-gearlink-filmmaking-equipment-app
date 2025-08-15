import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseEnv } from '@/constants/supabaseConfig';
import { selectTable } from '@/lib/supabaseRest';
import { EquipmentItem } from '@/types/equipment';

interface SupabaseState {
  enabled: boolean;
  equipment: EquipmentItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const [SupabaseProvider, useSupabase] = createContextHook<SupabaseState>(() => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const env = getSupabaseEnv();
    if (!env) return;
    try {
      setLoading(true);
      setError(null);
      const data = await selectTable<EquipmentItem>('equipment', { order: { column: 'inserted_at', ascending: false }, limit: 50 });
      setEquipment(data ?? []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      console.error('[Supabase] fetch error', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const env = getSupabaseEnv();
    setEnabled(!!env);
    if (env) {
      void refresh();
    }
  }, [refresh]);

  return useMemo(() => ({
    enabled,
    equipment,
    loading,
    error,
    refresh,
  }), [enabled, equipment, loading, error, refresh]);
});