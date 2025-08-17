import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, ShieldCheck, Palette, Globe, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [localization, setLocalization] = useState<string>('System');

  const clearCache = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Cleared', 'Local cache has been cleared. Restart app to apply.');
    } catch (e) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

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
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <Globe size={20} color="#FF6B35" />
          <Text style={styles.itemText}>Language</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Language', 'Localization is not implemented in this demo.') }>
          <Text style={styles.link}>{localization}</Text>
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
  danger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, padding: 14, backgroundColor: '#1C1C2E', borderRadius: 12 },
  dangerText: { color: '#FF6B35', fontWeight: '600' },
});
