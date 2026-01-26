import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  Text,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-native-phone-number-input';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { colors } from '../src/theme/colors';

export default function SignUp() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
  }>({});

  const phoneInputRef = useRef<PhoneInput>(null);

  const isFormValid = fullName.length > 0 && phone.length > 0 && email.length > 0 && password.length > 0;

  const handleSignUp = () => {
    setLoading(true);
    setErrors({});

    setTimeout(() => {
      setLoading(false);
      const newErrors: typeof errors = {};

      if (fullName.length < 2) {
        newErrors.fullName = t('signup.validationFullName');
      }

      if (phone.length < 5) {
        newErrors.phone = t('signup.validationPhone');
      }

      if (!email.includes('@')) {
        newErrors.email = t('signup.validationEmail');
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      Alert.alert(t('signup.successTitle'), t('signup.successMessage'));
    }, 1500);
  };

  const handleGoToLogin = () => {
    import('expo-router').then(({ router }) => {
      router.back();
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label={t('signup.fullName')}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setErrors(prev => ({ ...prev, fullName: undefined }));
            }}
            placeholder={t('signup.placeholderFullName')}
            autoCapitalize="words"
            error={errors.fullName}
          />

          <View style={styles.phoneContainer}>
            <Text style={styles.label}>{t('signup.phone')}</Text>
            <View style={[
              styles.phoneInputContainer,
              { borderColor: errors.phone ? colors.danger : colors.border },
            ]}>
              <PhoneInput
                ref={phoneInputRef}
                value={phone}
                defaultCode="US"
                layout="first"
                onChangeText={(text) => {
                  setPhone(text);
                  setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                onChangeCountry={() => {
                  // Country changed
                }}
                containerStyle={styles.phoneInput}
                textContainerStyle={styles.phoneTextInput}
                codeTextStyle={styles.phoneCodeText}
                flagButtonStyle={styles.phoneFlagButton}
                textInputStyle={styles.phoneTextInputStyle}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <Input
            label={t('signup.email')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder={t('signup.placeholderEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label={t('signup.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('signup.placeholderPassword')}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <Button
              title={t('signup.signUp')}
              onPress={handleSignUp}
              disabled={!isFormValid}
              loading={loading}
            />
          </View>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>{t('signup.haveAccount')} </Text>
            <Pressable onPress={handleGoToLogin}>
              <Text style={styles.loginLinkPressable}>{t('signup.goToLogin')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  phoneContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '400',
  },
  phoneInputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    width: '100%',
  },
  phoneTextInput: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  phoneCodeText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  phoneFlagButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    marginLeft: 4,
    marginVertical: 4,
  },
  phoneTextInputStyle: {
    fontSize: 16,
    color: colors.textPrimary,
    height: 50,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 12,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLinkPressable: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
