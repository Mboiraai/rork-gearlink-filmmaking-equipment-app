import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  currency: string;
}

const currencyMap: { [key: string]: string } = {
  'Uganda': 'UGX',
  'Tanzania': 'TZS',
  'Kenya': 'KES',
  'Rwanda': 'RWF',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'default': 'USD',
};

export const [LocationProvider, useLocation] = createContextHook(() => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestLocationPermission();
    } else {
      // Set default for web
      setLoading(false);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { country, city } = reverseGeocode[0];
        const detectedCurrency = currencyMap[country || ''] || currencyMap.default;
        
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          country: country || 'Unknown',
          city: city || 'Unknown',
          currency: detectedCurrency,
        });
        
        setCurrency(detectedCurrency);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    currency,
    loading,
    error,
    requestLocationPermission,
  };
});