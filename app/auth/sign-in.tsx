import React, { useCallback, useMemo, useState } from 'react';
import { Stack, router } from 'expo-router';
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LogIn, Eye, EyeOff, Mail, KeyRound } from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';

export default function SignInScreen() {
  const { signIn, authLoading, error } = useUser();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length > 0, [email, password]);

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return;
    const ok = await signIn(email.trim(), password);
    if (!ok) {
      Alert.alert('Sign in failed', error ?? 'Please try again');
      return;
    }
    router.back();
  }, [canSubmit, email, password, signIn, error]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sign In' }} />
      <View style={styles.header}>
        <LogIn size={28} color="#FF6B35" />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.inputRow}>
        <Mail size={18} color="#8E8E93" />
        <TextInput
          testID="signin-email"
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputRow}>
        <KeyRound size={18} color="#8E8E93" />
        <TextInput
          testID="signin-password"
          placeholder="Password"
          placeholderTextColor="#8E8E93"
          style={[styles.input, { flex: 1 }]}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(v => !v)} accessibilityLabel="Toggle password visibility">
          {showPassword ? <EyeOff size={18} color="#8E8E93" /> : <Eye size={18} color="#8E8E93" />}
        </TouchableOpacity>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity testID="signin-submit" style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]} disabled={!canSubmit || authLoading} onPress={onSubmit}>
        {authLoading ? <ActivityIndicator color="#0A0E27" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
      </TouchableOpacity>

      <TouchableOpacity testID="link-forgot" style={styles.linkBtn} onPress={() => router.push('/auth/forgot-password' as any)}>
        <Text style={styles.linkText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity testID="link-signup" style={styles.linkBtn} onPress={() => router.replace('/auth/sign-up' as any)}>
        <Text style={styles.linkText}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 24 },
  title: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 22 },
  subtitle: { color: '#8E8E93', fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C2E', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, gap: 10, marginBottom: 12 },
  input: { color: '#FFFFFF', fontSize: 16, flex: 1 },
  primaryBtn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#0A0E27', fontWeight: 'bold', fontSize: 16 },
  linkBtn: { alignSelf: 'center', marginTop: 12 },
  linkText: { color: '#8E8E93', textDecorationLine: 'underline' },
  errorText: { color: '#FF6B35', marginBottom: 8 },
});