import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface StoredAuthUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  userType: 'owner' | 'renter';
}

const USERS_KEY = 'auth:users';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
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
      if (storedUser) {
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
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      const users: StoredAuthUser[] = usersRaw ? JSON.parse(usersRaw) as StoredAuthUser[] : [];
      const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!match) {
        throw new Error('Invalid credentials');
      }
      const mapped: User = { id: match.id, name: match.name, email: match.email, avatar: match.avatar, userType: match.userType };
      await AsyncStorage.setItem('user', JSON.stringify(mapped));
      setUser(mapped);
      return true;
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
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      const users: StoredAuthUser[] = usersRaw ? JSON.parse(usersRaw) as StoredAuthUser[] : [];
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('Email already registered');
      }
      const newUser: StoredAuthUser = {
        id: generateId(),
        email,
        password,
        name: email.split('@')[0] ?? 'User',
        avatar: undefined,
        userType: 'renter',
      };
      const updated = [...users, newUser];
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
      const mapped: User = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, userType: newUser.userType };
      await AsyncStorage.setItem('user', JSON.stringify(mapped));
      setUser(mapped);
      return true;
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
      await AsyncStorage.multiRemove(['user']);
      setUser(null);
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