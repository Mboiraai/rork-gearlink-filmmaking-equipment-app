import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser as sbGetUser, signInWithEmail, signUpWithEmail, signOut as sbSignOut, SupabaseUser } from '@/lib/supabaseRest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  userType: 'owner' | 'renter';
}

interface UserContextValue {
  user: User | null;
  isVerified: boolean;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  saveUser: (userData: User) => Promise<void>;
  setVerified: (status: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

function mapSupabaseUser(u: SupabaseUser | null): User | null {
  if (!u) return null;
  const name = (u.user_metadata?.name as string | undefined) ?? (u.email?.split('@')[0] ?? 'User');
  const avatar = (u.user_metadata?.avatar as string | undefined) ?? undefined;
  const userTypeRaw = u.user_metadata?.userType as string | undefined;
  const userType: 'owner' | 'renter' = userTypeRaw === 'owner' ? 'owner' : 'renter';
  return { id: u.id, name, email: u.email ?? '', avatar, userType };
}

export const [UserProvider, useUser] = createContextHook<UserContextValue>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, []);

  const hydrate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedUser = await AsyncStorage.getItem('user');
      const verificationStatus = await AsyncStorage.getItem('isVerified');
      if (verificationStatus) setIsVerified(JSON.parse(verificationStatus));
      const sbUser = await sbGetUser();
      const mapped = mapSupabaseUser(sbUser);
      if (mapped) {
        await AsyncStorage.setItem('user', JSON.stringify(mapped));
        setUser(mapped);
      } else if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      } else {
        setUser(null);
      }
    } catch (e: unknown) {
      console.error('[UserProvider] hydrate error', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUser = useCallback(async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (e: unknown) {
      console.error('Error saving user data:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, []);

  const setVerified = useCallback(async (status: boolean) => {
    try {
      await AsyncStorage.setItem('isVerified', JSON.stringify(status));
      setIsVerified(status);
    } catch (e: unknown) {
      console.error('Error saving verification status:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      setError(null);
      const session = await signInWithEmail({ email, password });
      const sbUser = await sbGetUser();
      const mapped = mapSupabaseUser(sbUser);
      if (mapped) {
        await AsyncStorage.setItem('user', JSON.stringify(mapped));
        setUser(mapped);
      }
      return !!session?.access_token;
    } catch (e: unknown) {
      console.error('[Auth] signIn error', e);
      setError(e instanceof Error ? e.message : 'Failed to sign in');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      setError(null);
      const session = await signUpWithEmail({ email, password });
      const sbUser = await sbGetUser();
      const mapped = mapSupabaseUser(sbUser);
      if (mapped) {
        await AsyncStorage.setItem('user', JSON.stringify(mapped));
        setUser(mapped);
      }
      return !!session?.access_token;
    } catch (e: unknown) {
      console.error('[Auth] signUp error', e);
      setError(e instanceof Error ? e.message : 'Failed to sign up');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthLoading(true);
      setError(null);
      await sbSignOut();
      await AsyncStorage.multiRemove(['user', 'isVerified']);
      setUser(null);
      setIsVerified(false);
    } catch (e: unknown) {
      console.error('Error logging out:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  return useMemo(() => ({
    user,
    isVerified,
    loading,
    authLoading,
    error,
    saveUser,
    setVerified,
    signIn,
    signUp,
    logout,
  }), [user, isVerified, loading, authLoading, error, saveUser, setVerified, signIn, signUp, logout]);
});