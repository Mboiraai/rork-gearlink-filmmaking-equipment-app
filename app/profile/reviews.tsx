import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function ReviewsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Reviews' }} />
      <Text style={styles.text}>Reviews coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF' },
});
