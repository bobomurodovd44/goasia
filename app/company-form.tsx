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
import { router, usePathname } from 'expo-router';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import Toggle from '../src/components/Toggle';
import LocationInput from '../src/components/LocationInput';
import LocationMapModal from '../src/components/LocationMapModal';
import { useLocation } from '../src/hooks/useLocation';
import { Address } from '../src/types/address';
import '../src/i18n';
import { colors } from '../src/theme/colors';
import { useSignupWizard } from '../src/store/signupWizard';
import { signupApi } from '../src/services/signupApi';
import { useAuth } from '../src/contexts/AuthContext';

type CompanyType = 'llc' | 'individual';

export default function CompanyForm() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const store = useSignupWizard();
  const { setUser } = useAuth();
  
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
  const [isInitialized, setIsInitialized] = useState(false);

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

  useEffect(() => {
    const checkStep1Completion = () => {
      const state = store;
      
      if (!state.step1Completed || !state.email || !state.password) {
        Alert.alert(
          'Incomplete Registration',
          'Please complete Step 1 first to create your account.',
          [{ 
            text: 'OK', 
            onPress: () => {
              store.resetWizard();
              router.replace('/signup');
            }
          }]
        );
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!state.email || !emailRegex.test(state.email)) {
        store.resetWizard();
        router.replace('/signup');
        return false;
      }
      
      if (!state.password || state.password.length < 6) {
        store.resetWizard();
        router.replace('/signup');
        return false;
      }
      
      return true;
    };

    if (pathname === '/company-form' && !isInitialized) {
      const isValid = checkStep1Completion();
      setIsInitialized(true);
      
      if (isValid) {
        setCompanyName('');
        setCompanyType('llc');
      }
    }
  }, [pathname, store, isInitialized]);

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
      Alert.alert('Validation', 'Please enter your company name');
      return;
    }
    if (!selectedLocation || !selectedAddress) {
      Alert.alert('Validation', 'Please select your company location');
      return;
    }

    setFormLoading(true);

    try {
      const result = await signupApi.submitRegistration({
        email: store.email!,
        password: store.password!,
        firstName: store.firstName,
        lastName: store.lastName,
        phone: store.phone,
        companyData: {
          companyName: companyName.trim(),
          companyType,
          location: selectedLocation,
          address: selectedAddress,
        },
      });

      setUser(result.user as any);
      store.resetWizard();

      Alert.alert(
        'Success',
        'Your account has been created successfully!',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to create your account. Please try again.',
        [{ text: 'Retry' }, { text: 'Cancel', style: 'cancel' }]
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const addressDisplayText = selectedAddress
    ? `${selectedAddress.city}${selectedAddress.city && selectedAddress.country ? ', ' : ''}${selectedAddress.country}`
    : undefined;

  if (!store.step1Completed) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <View style={styles.header}>
            <Text style={styles.stepIndicator}>Step 2 of 2</Text>
            <Text style={styles.title}>Company Information</Text>
            <Text style={styles.subtitle}>
              Complete your company details to finish registration
            </Text>
          </View>

          <Input
            label="Email"
            value={store.email || ''}
            disabled={true}
            placeholder="Email"
          />

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
              title="Back"
              onPress={handleBack}
              variant="secondary"
            />
          </View>

          <View style={styles.submitButtonContainer}>
            <Button
              title="Create Account"
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
  header: {
    marginBottom: 24,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
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
  submitButtonContainer: {
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
