import React, { useCallback, useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Mail } from 'lucide-react-native';
import { resetPasswordForEmail } from '@/lib/supabaseRest';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<boolean>(false);

  const isValidEmail = useCallback((val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), []);
  const canSubmit = useMemo(() => isValidEmail(email), [email, isValidEmail]);

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await resetPasswordForEmail(email.trim());
      setSent(true);
      Alert.alert('Email sent', 'Check your inbox for the reset link.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Reset Password' }} />

      <Text style={styles.title}>Forgot your password?</Text>
      <Text style={styles.subtitle}>Enter your email and we will send you a reset link.</Text>

      <View style={styles.inputRow}>
        <Mail size={18} color="#8E8E93" />
        <TextInput
          testID="forgot-email"
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {sent && <Text style={styles.successText}>If an account exists, you will receive an email shortly.</Text>}

      <TouchableOpacity testID="forgot-submit" style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]} disabled={!canSubmit || loading} onPress={onSubmit}>
        {loading ? <ActivityIndicator color="#0A0E27" /> : <Text style={styles.primaryBtnText}>Send reset link</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  title: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 22, marginTop: 12 },
  subtitle: { color: '#8E8E93', fontSize: 14, marginTop: 8, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C2E', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, gap: 10, marginBottom: 12 },
  input: { color: '#FFFFFF', fontSize: 16, flex: 1 },
  primaryBtn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#0A0E27', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#FF6B35', marginBottom: 8 },
  successText: { color: '#4CAF50', marginBottom: 8 },
});