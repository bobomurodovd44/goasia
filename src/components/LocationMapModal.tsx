import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useDebounce } from '../hooks/useDebounce';
import { Address } from '../types/address';

const MAP_URL = 'https://nominatim.openstreetmap.org';
const APP_NAME = 'goasia-app';

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    country?: string;
    country_code?: string;
    region?: string;
    state?: string;
    city?: string;
    county?: string;
    town?: string;
    village?: string;
    postcode?: string;
  };
}

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: { latitude: number; longitude: number }, address: Address) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
  initialAddress?: Address | null;
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
      return null;
    }

    return await response.json();
  } catch (err) {
    return null;
  }
}

export default function LocationMapModal({
  visible,
  onClose,
  onSelect,
  initialLocation,
  initialAddress,
}: LocationMapModalProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation || null
  );
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(initialAddress || null);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 41.3111,
    longitude: initialLocation?.longitude || 69.2797,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim() && debouncedSearch.length >= 2) {
      searchAddress(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  const searchAddress = async (query: string) => {
    setIsSearching(true);
    try {
      const url = `${MAP_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
      const results = await fetchNominatim<SearchResult[]>(url);
      setSearchResults(results || []);
    } catch (error) {
      console.warn('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };
    setSelectedLocation(newLocation);
    setRegion({
      ...region,
      latitude,
      longitude,
    });
    fetchAddressForCoords(latitude, longitude);
  };

  const fetchAddressForCoords = async (lat: number, lon: number) => {
    try {
      const url = `${MAP_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`;
      const data = await fetchNominatim<any>(url);
      
      if (!data) {
        return;
      }

      const addressData: Address = {
        country: data.address?.country || '',
        countryCode: (data.address?.country_code || '').toUpperCase(),
        region: data.address?.region || data.address?.state || '',
        city: data.address?.city || data.address?.county || data.address?.town || data.address?.village || '',
        postalCode: data.address?.postcode || '',
      };
      setSelectedAddress(addressData);
    } catch (error) {
      console.warn('Error fetching address:', error);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    const coords = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    setSelectedLocation(coords);
    setRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    const addressData: Address = {
      country: result.address?.country || '',
      countryCode: (result.address?.country_code || '').toUpperCase(),
      region: result.address?.region || result.address?.state || '',
      city: result.address?.city || result.address?.county || result.address?.town || result.address?.village || '',
      postalCode: result.address?.postcode || '',
    };
    setSelectedAddress(addressData);
    setSearchText('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleUseMyLocation = () => {
    if (initialLocation) {
      const newLocation = { latitude: initialLocation.latitude, longitude: initialLocation.longitude };
      setSelectedLocation(newLocation);
      setRegion({
        ...region,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      });
      if (initialAddress) {
        setSelectedAddress(initialAddress);
      }
    }
  };

  const handleDone = () => {
    if (selectedLocation && selectedAddress) {
      onSelect(selectedLocation, selectedAddress);
    }
    onClose();
  };

  const handleClose = () => {
    setSearchText('');
    setSearchResults([]);
    onClose();
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
      <Text style={styles.resultText} numberOfLines={2}>
        {item.display_name}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Select Location</Text>
            <Pressable style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a place..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={colors.textSecondary}
              />
              {isSearching && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>
            {searchResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item, index) => index.toString()}
                  keyboardShouldPersistTaps="handled"
                  style={styles.resultsList}
                />
              </View>
            ) : searchText.length >= 2 && !isSearching && (
              <View style={styles.resultsContainer}>
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              showsUserLocation={true}
              followsUserLocation={false}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  pinColor={colors.primary}
                />
              )}
            </MapView>
          </View>

          <View style={styles.footer}>
            {selectedAddress && (
              <View style={styles.selectedAddress}>
                <Ionicons name="location" size={18} color={colors.primary} />
                <View style={styles.addressTextContainer}>
                  <Text style={styles.addressText}>
                    {selectedAddress.city}, {selectedAddress.country}
                  </Text>
                </View>
              </View>
            )}
            <Pressable
              style={styles.myLocationButton}
              onPress={handleUseMyLocation}
            >
              <Ionicons name="locate" size={18} color={colors.primary} />
              <Text style={styles.myLocationText}>Use My Location</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  doneButton: {
    padding: 4,
  },
  doneButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.disabledBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  resultsContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 200,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  noResults: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  selectedAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  myLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  myLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
