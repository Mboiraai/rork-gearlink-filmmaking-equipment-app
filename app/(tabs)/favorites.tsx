import React, { useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { equipmentData } from '@/mocks/equipment';

export default function FavoritesScreen() {
  const favorites = useMemo(() => equipmentData.slice(0, 8), []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Favorites' }} />
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={48} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>Tap the heart on a listing to save it</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/equipment/${item.id}` as any)}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.category}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27' },
  list: { padding: 20, gap: 12 },
  card: { backgroundColor: '#1C1C2E', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  image: { width: '100%', height: 180 },
  info: { padding: 12 },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#8E8E93', marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  emptySubtitle: { color: '#8E8E93' },
});