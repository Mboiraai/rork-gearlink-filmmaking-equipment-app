import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Save, Upload } from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';

export default function EditProfileScreen() {
  const { user, updateProfile, authLoading } = useUser();
  const [name, setName] = useState<string>(user?.name ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [avatar, setAvatar] = useState<string>(user?.avatar ?? '');

  const placeholder = useMemo(() => 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400', []);

  const onSave = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter your full name.'); return; }
    if (!/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) { Alert.alert('Invalid email', 'Please enter a valid email.'); return; }
    await updateProfile({ name: name.trim(), email: email.trim(), avatar: avatar || undefined });
    Alert.alert('Saved', 'Profile updated');
  };

  const pickAvatar = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Tip', 'On web, paste a direct image URL into the Avatar URL field.');
      return;
    }
    const ImagePicker = await import('expo-image-picker');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Allow photo library access to pick an avatar.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1,1] });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      const uri = res.assets[0]?.uri ?? '';
      setAvatar(uri);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Profile' }} />

      <View style={styles.header}>
        <Image source={{ uri: avatar || placeholder }} style={styles.avatar} />
        <TouchableOpacity testID="change-avatar" style={styles.secondaryBtn} onPress={pickAvatar}>
          <Upload size={16} color="#FF6B35" />
          <Text style={styles.secondaryBtnText}>Change avatar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Full name</Text>
      <TextInput testID="name" value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#8E8E93" style={styles.input} />

      <Text style={styles.label}>Email</Text>
      <TextInput testID="email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor="#8E8E93" style={styles.input} />

      <Text style={styles.label}>Avatar URL</Text>
      <TextInput testID="avatar" value={avatar} onChangeText={setAvatar} autoCapitalize="none" placeholder="https://..." placeholderTextColor="#8E8E93" style={styles.input} />

      <TouchableOpacity testID="save" style={styles.primaryBtn} onPress={onSave} disabled={authLoading}>
        {authLoading ? <ActivityIndicator color="#0A0E27" /> : (
          <>
            <Save size={18} color="#0A0E27" />
            <Text style={styles.primaryBtnText}>Save changes</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  label: { color: '#8E8E93', marginBottom: 6 },
  input: { backgroundColor: '#1C1C2E', color: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
  primaryBtn: { flexDirection: 'row', gap: 8, backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryBtnText: { color: '#0A0E27', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { flexDirection: 'row', gap: 8, backgroundColor: '#1C1C2E', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  secondaryBtnText: { color: '#FF6B35', fontWeight: '600' },
});
