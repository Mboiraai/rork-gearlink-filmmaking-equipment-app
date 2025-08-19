import React, { useCallback, useMemo, useState } from 'react';
import { Stack, router } from 'expo-router';
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserPlus, Eye, EyeOff, Mail, KeyRound, CheckCircle2 } from 'lucide-react-native';
import { useUser } from '@/providers/UserProvider';

export default function SignUpScreen() {
  const { signUp, authLoading, error } = useUser();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const isValidEmail = useCallback((val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), []);
  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && isValidEmail(email) && passwordScore >= 2 && password === confirmPassword && acceptTerms;
  }, [name, email, passwordScore, password, confirmPassword, acceptTerms, isValidEmail]);

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return;
    const ok = await signUp(email.trim(), password, name.trim());
    if (!ok) {
      Alert.alert('Sign up failed', error ?? 'Please try again');
      return;
    }
    router.replace('/auth/verify-email' as any);
  }, [canSubmit, email, password, name, signUp, error]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Account' }} />
      <View style={styles.header}>
        <UserPlus size={28} color="#FF6B35" />
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join GearLink to rent and list equipment</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          testID="signup-name"
          placeholder="Full name"
          placeholderTextColor="#8E8E93"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputRow}>
        <Mail size={18} color="#8E8E93" />
        <TextInput
          testID="signup-email"
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
          testID="signup-password"
          placeholder="Create a password"
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

      <View style={styles.inputRow}>
        <KeyRound size={18} color="#8E8E93" />
        <TextInput
          testID="signup-confirm-password"
          placeholder="Confirm password"
          placeholderTextColor="#8E8E93"
          style={[styles.input, { flex: 1 }]}
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity testID="accept-terms" style={styles.termsRow} onPress={() => setAcceptTerms(v => !v)}>
        <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
          {acceptTerms && <CheckCircle2 size={16} color="#0A0E27" />}
        </View>
        <Text style={styles.linkText}>I agree to the Terms and Privacy Policy</Text>
      </TouchableOpacity>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity testID="signup-submit" style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]} disabled={!canSubmit || authLoading} onPress={onSubmit}>
        {authLoading ? <ActivityIndicator color="#0A0E27" /> : <Text style={styles.primaryBtnText}>Create Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity testID="link-signin" style={styles.linkBtn} onPress={() => router.replace('/auth/sign-in' as any)}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
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
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, marginTop: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#1C1C2E', borderWidth: 1, borderColor: '#2A2A3B', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
});