import React, { useCallback, useState } from 'react';
import { Stack } from 'expo-router';
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MailCheck, RefreshCcw } from 'lucide-react-native';
import { resendEmailVerification } from '@/lib/supabaseRest';

export default function VerifyEmailScreen() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('We sent a verification link to your email. Please check your inbox.');

  const onResend = useCallback(async () => {
    try {
      setLoading(true);
      await resendEmailVerification(email.trim());
      setMessage('Verification email sent. Check your inbox.');
      Alert.alert('Sent', 'We have resent the verification email.');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Verify Email' }} />
      <View style={styles.header}>
        <MailCheck size={28} color="#FF6B35" />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>{message}</Text>
      </View>

      <TextInput
        testID="verify-email-input"
        placeholder="Enter your email"
        placeholderTextColor="#8E8E93"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity testID="resend-email" style={styles.primaryBtn} onPress={onResend} disabled={loading || email.trim().length === 0}>
        {loading ? <ActivityIndicator color="#0A0E27" /> : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <RefreshCcw size={18} color="#0A0E27" />
            <Text style={styles.primaryBtnText}>Resend verification email</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 24 },
  title: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 22 },
  subtitle: { color: '#8E8E93', fontSize: 14, textAlign: 'center', marginHorizontal: 16 },
  input: { backgroundColor: '#1C1C2E', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFFFFF', marginBottom: 12 },
  primaryBtn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#0A0E27', fontWeight: 'bold', fontSize: 16 },
});