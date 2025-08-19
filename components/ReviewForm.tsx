import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Platform } from 'react-native';
import { Star, Send } from 'lucide-react-native';
import type { CreateReviewInput, Review } from '@/types/review';
import { useUser } from '@/providers/UserProvider';

interface Props {
  equipmentId: string;
  onSubmit: (review: Review) => void;
}

export default function ReviewForm({ equipmentId, onSubmit }: Props) {
  const { user } = useUser();
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const canSubmit = useMemo(() => rating > 0 && text.trim().length >= 8 && !!user?.id, [rating, text, user]);

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Sign in required', 'Please sign in to leave a review.');
        return;
      }
      if (!canSubmit) return;
      setSubmitting(true);
      const base: CreateReviewInput = {
        equipmentId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating,
        text: text.trim(),
      };
      const newReview: Review = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...base,
      };
      onSubmit(newReview);
      setRating(0);
      setText('');
    } catch (e) {
      console.error('[ReviewForm] submit error', e);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate and Review</Text>
      <View style={styles.stars}>
        {new Array(5).fill(null).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= rating;
          return (
            <Pressable key={idx} onPress={() => setRating(idx)} accessibilityRole="button" testID={`star-${idx}`}>
              <Star size={24} color={filled ? '#FFD700' : '#6B6F8A'} fill={filled ? '#FFD700' : 'transparent'} />
            </Pressable>
          );
        })}
      </View>
      <TextInput
        style={styles.input as any}
        placeholder="Share your experience..."
        placeholderTextColor="#6B6F8A"
        value={text}
        onChangeText={(t: string) => setText(t)}
        multiline
        numberOfLines={4}
        maxLength={600}
      />
      <Pressable
        testID="submit-review"
        accessibilityRole="button"
        onPress={handleSubmit}
        disabled={!canSubmit || submitting}
        style={[styles.button, (!canSubmit || submitting) && { opacity: 0.5 }]}
      >
        <Send size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Post Review'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0A0E27', borderTopWidth: 1, borderTopColor: '#1C1C2E', padding: 16, borderRadius: 12 },
  title: { color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { backgroundColor: '#14172F', color: '#E0E0E0', borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top' },
  button: { marginTop: 12, backgroundColor: '#FF6B35', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});