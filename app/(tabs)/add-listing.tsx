import React, { useCallback } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { PlusCircle } from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';

export default function AddListingTabScreen() {
  const { user } = useUser();

  const onCreatePress = useCallback(() => {
    console.log('[AddListingTab] go to new listing');
    router.push('/owner/new-listing' as any);
  }, []);

  const onSignInPress = useCallback(() => {
    console.log('[AddListingTab] navigate to profile for sign-in');
    router.push('/(tabs)/profile' as any);
  }, []);

  return (
    <View style={styles.container} testID="add-listing-tab">
      <Stack.Screen options={{ title: 'Add Listing' }} />
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1526178611453-5dc3c3d3d0c5?q=80&w=1200&auto=format&fit=crop' }}
        style={styles.hero}
      />
      <View style={styles.content}>
        <Text style={styles.title}>List Your Gear</Text>
        <Text style={styles.subtitle}>Earn by renting out cameras, lenses, lighting and more.</Text>
        {user ? (
          <TouchableOpacity testID="create-listing" style={styles.primaryBtn} onPress={onCreatePress}>
            <PlusCircle size={18} color="#0A0E27" />
            <Text style={styles.primaryText}>Create New Listing</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity testID="sign-in-to-list" style={styles.primaryBtn} onPress={onSignInPress}>
            <PlusCircle size={18} color="#0A0E27" />
            <Text style={styles.primaryText}>Sign in to start listing</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27' },
  hero: { width: '100%', height: 220 },
  content: { padding: 20, gap: 12 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#8E8E93', fontSize: 14 },
  primaryBtn: { marginTop: 8, backgroundColor: '#FF6B35', padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: '#0A0E27', fontWeight: 'bold', fontSize: 16 },
});