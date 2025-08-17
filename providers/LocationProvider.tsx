import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                const detectedCurrency = currencyMap.default;
                setLocation({ latitude, longitude, country: 'Unknown', city: 'Unknown', currency: detectedCurrency });
                setCurrency(detectedCurrency);
                resolve();
              },
              (err) => {
                console.warn('[Location] Web geolocation error', err?.message ?? err);
                setError('Failed to get location');
                resolve();
              }
            );
          });
        } else {
          setError('Geolocation not available');
        }
        return;
      }

      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { country, city } = reverseGeocode[0] as { country?: string; city?: string };
        const detectedCurrency = currencyMap[country ?? ''] ?? currencyMap.default;
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          country: country ?? 'Unknown',
          city: city ?? 'Unknown',
          currency: detectedCurrency,
        });
        setCurrency(detectedCurrency);
      }
    } catch (e: unknown) {
      console.error('[Location] Error getting location', e);
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void requestLocationPermission();
  }, [requestLocationPermission]);

  const manualSetCurrency = useCallback(async (code: string) => {
    try {
      setCurrency(code);
      if (location) {
        setLocation({ ...location, currency: code });
      }
      await import('@react-native-async-storage/async-storage').then(async (m) => {
        await m.default.setItem('pref:currency', code);
      });
    } catch (e) {
      console.error('[Location] set currency error', e);
    }
  }, [location]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await import('@react-native-async-storage/async-storage');
        const stored = await m.default.getItem('pref:currency');
        if (mounted && stored) {
          setCurrency(stored);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  return useMemo(() => ({
    location,
    currency,
    loading,
    error,
    requestLocationPermission,
    setCurrency: manualSetCurrency,
  }), [location, currency, loading, error, requestLocationPermission, manualSetCurrency]);
});