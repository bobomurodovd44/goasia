import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Address } from '../types/address';

const MAP_URL = 'https://nominatim.openstreetmap.org';
const APP_NAME = 'goasia-app';

interface LocationResult {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: LocationResult | null;
  address: Address | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  fetchCurrentLocation: () => Promise<void>;
  fetchAddressFromCoords: (lat: number, lon: number) => Promise<Address | null>;
}

async function fetchNominatim<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': `${APP_NAME}/1.0 (contact@goasia.app)`,
      },
    });

    if (!response.ok) {
      console.warn(`Nominatim API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn('Nominatim fetch error:', err);
    return null;
  }
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      setError('Failed to request location permission');
      setHasPermission(false);
      return false;
    }
  }, []);

  const fetchAddressFromCoords = useCallback(async (lat: number, lon: number): Promise<Address | null> => {
    try {
      const url = `${MAP_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`;
      const data = await fetchNominatim<any>(url);
      
      if (!data) {
        return null;
      }

      const addressData: Address = {
        country: data.address?.country || '',
        countryCode: (data.address?.country_code || '').toUpperCase(),
        region: data.address?.region || data.address?.state || '',
        city: data.address?.city || data.address?.county || data.address?.town || data.address?.village || '',
        postalCode: data.address?.postcode || '',
      };
      
      return addressData;
    } catch (err) {
      console.error('Error fetching address:', err);
      return null;
    }
  }, []);

  const fetchCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const granted = await requestPermission();
      if (!granted) {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      setLocation(newLocation);

      const addressData = await fetchAddressFromCoords(newLocation.latitude, newLocation.longitude);
      if (addressData) {
        setAddress(addressData);
      }
    } catch (err) {
      setError('Failed to get current location');
      console.error('Error fetching location:', err);
    } finally {
      setLoading(false);
    }
  }, [requestPermission, fetchAddressFromCoords]);

  return {
    location,
    address,
    loading,
    error,
    hasPermission,
    requestPermission,
    fetchCurrentLocation,
    fetchAddressFromCoords,
  };
}
