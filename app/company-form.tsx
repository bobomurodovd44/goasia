import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import Toggle from '../src/components/Toggle';
import LocationInput from '../src/components/LocationInput';
import LocationMapModal from '../src/components/LocationMapModal';
import { useLocation } from '../src/hooks/useLocation';
import { Address } from '../src/types/address';
import '../src/i18n';
import { colors } from '../src/theme/colors';

type CompanyType = 'llc' | 'individual';

export default function CompanyForm() {
  const { t } = useTranslation();
  const {
    fetchCurrentLocation,
    loading: locationLoading,
    hasPermission,
    requestPermission,
    address: initialAddress,
    location: initialLocation,
  } = useLocation();

  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('llc');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const toggleOptions = [
    { label: 'LLC', value: 'llc' },
    { label: 'Individual', value: 'individual' },
  ];

  useEffect(() => {
    const initLocation = async () => {
      await requestPermission();
      await fetchCurrentLocation();
    };
    initLocation();
  }, []);

  useEffect(() => {
    if (initialLocation && !selectedLocation) {
      setSelectedLocation(initialLocation);
    }
    if (initialAddress && !selectedAddress) {
      setSelectedAddress(initialAddress);
    }
  }, [initialLocation, initialAddress]);

  const handleLocationSelect = (
    location: { latitude: number; longitude: number },
    address: Address
  ) => {
    setSelectedLocation(location);
    setSelectedAddress(address);
    setShowMapModal(false);
  };

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      Alert.alert('Validation', 'Please enter company name');
      return;
    }
    if (!selectedLocation || !selectedAddress) {
      Alert.alert('Validation', 'Please select a location');
      return;
    }

    setFormLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const formData = {
      companyName: companyName.trim(),
      companyType,
      location: selectedLocation,
      address: selectedAddress,
    };

    console.log('Company Form Data:', JSON.stringify(formData, null, 2));

    setFormLoading(false);

    Alert.alert('Success', 'Company data logged to console', [
      { text: 'OK', onPress: () => console.log('Form submitted') },
    ]);
  };

  const addressDisplayText = selectedAddress
    ? `${selectedAddress.city}${selectedAddress.city && selectedAddress.country ? ', ' : ''}${selectedAddress.country}`
    : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Company Information</Text>
          <Text style={styles.subtitle}>
            Please fill in your company details
          </Text>

          <Input
            label={t('companyForm.companyNameLabel') || 'Company Name'}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder={t('companyForm.companyNamePlaceholder') || 'Enter company name'}
            autoCapitalize="words"
          />

          <View style={styles.toggleContainer}>
            <Text style={styles.label}>
              {t('companyForm.companyTypeLabel') || 'Company Type'}
            </Text>
            <Toggle
              options={toggleOptions}
              selected={companyType}
              onSelect={(value) => setCompanyType(value as CompanyType)}
            />
          </View>

          <LocationInput
            label={t('companyForm.addressLabel') || 'Address'}
            value={addressDisplayText}
            onPress={() => setShowMapModal(true)}
            placeholder={t('companyForm.addressPlaceholder') || 'Select company address'}
            loading={locationLoading}
          />

          <View style={styles.buttonContainer}>
            <Button
              title={t('companyForm.submitButton') || 'Save'}
              onPress={handleSubmit}
              disabled={!companyName.trim() || !selectedLocation || !selectedAddress}
              loading={formLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationMapModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSelect={handleLocationSelect}
        initialLocation={selectedLocation}
        initialAddress={selectedAddress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  toggleContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 16,
  },
});
