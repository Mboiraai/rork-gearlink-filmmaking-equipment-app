import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  userType: 'owner' | 'renter';
}

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const verificationStatus = await AsyncStorage.getItem('isVerified');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      if (verificationStatus) {
        setIsVerified(JSON.parse(verificationStatus));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const setVerified = async (status: boolean) => {
    try {
      await AsyncStorage.setItem('isVerified', JSON.stringify(status));
      setIsVerified(status);
    } catch (error) {
      console.error('Error saving verification status:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'isVerified']);
      setUser(null);
      setIsVerified(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    user,
    isVerified,
    loading,
    saveUser,
    setVerified,
    logout,
  };
});