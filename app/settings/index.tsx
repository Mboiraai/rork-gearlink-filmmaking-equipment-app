import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, ShieldCheck, Palette, Globe, Trash2, DollarSign, UserCog, ServerCog } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from '@/providers/LocationProvider';
import { router } from 'expo-router';
import { getSupabaseEnv } from '@/constants/supabaseConfig';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [localization, setLocalization] = useState<string>('System');
  const { currency, setCurrency } = useLocation() as unknown as { currency: string; setCurrency: (c: string) => Promise<void> };
  const currencyOptions = useMemo(() => ['UGX','TZS','KES','RWF','USD','GBP','EUR'], []);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyMessage, setVerifyMessage] = useState<string>('Not checked yet');

  const clearCache = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Cleared', 'Local cache has been cleared. Restart app to apply.');
    } catch (e) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const chooseCurrency = () => {
    Alert.alert(
      'Select currency',
      'Choose your preferred currency',
      [
        ...currencyOptions.map((code) => ({ text: code + (code === currency ? ' •' : ''), onPress: () => { void setCurrency(code); } })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const verifySupabase = async () => {
    const env = getSupabaseEnv();
    if (!env) {
      setVerifyMessage('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
      Alert.alert('Supabase', 'Environment variables missing.');
      return;
    }
    try {
      setVerifying(true);
      setVerifyMessage('Checking...');
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 10000);
      const authHealth = await fetch(`${env.url}/auth/v1/health`, { headers: { apikey: env.anonKey }, signal: controller.signal });
      clearTimeout(t);
      const authOk = authHealth.ok;
      let restOk = false;
      try {
        const restRes = await fetch(`${env.url}/rest/v1/`, { method: 'OPTIONS', headers: { apikey: env.anonKey } });
        restOk = restRes.ok || restRes.status === 204 || restRes.status === 200;
      } catch (e) {
        restOk = false;
      }
      if (authOk && restOk) {
        setVerifyMessage('Connected');
        Alert.alert('Supabase', 'Connected successfully.');
      } else if (authOk) {
        setVerifyMessage('Auth OK, REST unreachable');
        Alert.alert('Supabase', 'Auth reachable, REST endpoint not responding.');
      } else {
        const text = await authHealth.text();
        setVerifyMessage(`Auth unreachable ${authHealth.status}: ${text}`);
        Alert.alert('Supabase', `Auth not reachable: ${authHealth.status}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setVerifyMessage(`Failed: ${msg}`);
      Alert.alert('Supabase', `Failed: ${msg}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <Text style={styles.sectionTitle}>Connectivity</Text>
      <TouchableOpacity testID="verify-supabase" style={styles.item} onPress={verifySupabase} disabled={verifying}>
        <View style={styles.itemLeft}>
          <ServerCog size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Verify Supabase connectivity</Text>
        </View>
        {verifying ? <ActivityIndicator color="#FF6B35" /> : <Text style={styles.link}>Run</Text>}
      </TouchableOpacity>
      <Text testID="verify-supabase-status" style={styles.status}>{verifyMessage}</Text>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <Bell size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Push notifications</Text>
        </View>
        <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#1C1C2E', true: '#FF6B35' }} thumbColor="#FFFFFF" />
      </View>
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <Palette size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Dark mode</Text>
        </View>
        <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#1C1C2E', true: '#FF6B35' }} thumbColor="#FFFFFF" />
      </View>

      <Text style={styles.sectionTitle}>Privacy</Text>
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <ShieldCheck size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Two-factor Authentication</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('2FA', '2FA setup flow not implemented in this demo.') }>
          <Text style={styles.link}>Manage</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>General</Text>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/profile/edit' as any)}>
        <View style={styles.itemLeft}>
          <UserCog size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Edit account</Text>
        </View>
        <Text style={styles.link}>Open</Text>
      </TouchableOpacity>
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <Globe size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Language</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Language', 'Localization is not implemented in this demo.') }>
          <Text style={styles.link}>{localization}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <DollarSign size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Currency</Text>
        </View>
        <TouchableOpacity onPress={chooseCurrency}>
          <Text style={styles.link}>{currency}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.danger} onPress={clearCache}>
        <Trash2 size={20} color="#FF6B35" />
        <Text style={styles.dangerText}>Clear local cache</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1C1C2E' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemText: { color: '#FFFFFF', fontSize: 16 },
  link: { color: '#FF6B35', fontWeight: '600' },
  status: { color: '#9BA1A6', fontSize: 12, marginTop: 6 },
  danger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, padding: 14, backgroundColor: '#1C1C2E', borderRadius: 12 },
  dangerText: { color: '#FF6B35', fontWeight: '600' },
});
