import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { Star } from 'lucide-react-native';
import type { Review } from '@/types/review';

interface Props {
  reviews: Review[];
}

export default function ReviewList({ reviews }: Props) {
  const avg = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Star size={18} color="#FFD700" fill="#FFD700" />
        <Text style={styles.avg}>{avg.toFixed(1)}</Text>
        <Text style={styles.count}>({reviews.length} reviews)</Text>
      </View>
      <FlatList
        data={reviews}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={styles.item} testID="review-item">
            <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.userName}</Text>
                <View style={styles.ratingRow}>
                  {new Array(5).fill(null).map((_, i) => (
                    <Star key={i} size={14} color={i < item.rating ? '#FFD700' : '#3A3F65'} fill={i < item.rating ? '#FFD700' : 'transparent'} />
                  ))}
                </View>
              </View>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0A0E27' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  avg: { color: '#FFFFFF', fontWeight: '700' },
  count: { color: '#8E8E93', fontSize: 12 },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  body: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#FFFFFF', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', gap: 2 },
  text: { color: '#E0E0E0', marginTop: 4, lineHeight: 20 },
  date: { color: '#6B6F8A', fontSize: 12, marginTop: 6 },
  separator: { height: 1, backgroundColor: '#1C1C2E', marginVertical: 8 },
});