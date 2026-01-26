import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Animated, {
    FadeInDown
} from 'react-native-reanimated';
import Button from '../src/components/Button';
import Input from '../src/components/Input';
import '../src/i18n';
import { colors } from '../src/theme/colors';

export default function SignUp() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
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
        newErrors.fullName = t('signup.validationFullName') || 'Full name is too short';
      }

      const checkPhone = phoneInputRef.current?.isValidNumber(phone);
      if (!checkPhone) {
        newErrors.phone = t('signup.validationPhone') || 'Invalid phone number';
      }

      if (!email.includes('@')) {
        newErrors.email = t('signup.validationEmail') || 'Invalid email address';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      Alert.alert(t('signup.successTitle') || 'Success', t('signup.successMessage') || 'Account created successfully');
    }, 1500);
  };

  const handleGoToLogin = () => {
    router.replace('/login');
  };

  const handleGoogleSignIn = () => {
    router.replace('/(tabs)');
  };

  const getPhoneBorderColor = () => {
    if (errors.phone) return colors.danger;
    if (phoneFocused) return colors.focus;
    return colors.border;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.googleSection}>
              <View style={styles.googleButtonContainer}>
                <Button
                  title={t('login.continueWithGoogle') || 'Continue with Google'}
                  onPress={handleGoogleSignIn}
                  variant="secondary"
                  icon={
                    <View style={styles.googleIconContainer}>
                      <AntDesign name="google" size={24} color="#333333" />
                    </View>
                  }
                  textStyle={styles.googleButtonText}
                />
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('login.or') || 'OR'}</Text>
                <View style={styles.dividerLine} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
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
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.phoneWrapper}>
              <Text style={styles.label}>{t('signup.phone')}</Text>
              <View style={[
                styles.phoneInputOuterContainer,
                { borderColor: getPhoneBorderColor() },
              ]}>
                <View style={styles.phoneIconLeft}>
                  <Ionicons name="call" size={18} color={colors.textSecondary} />
                </View>
                <PhoneInput
                  ref={phoneInputRef}
                  value={phone}
                  defaultCode="UZ"
                  layout="first"
                  onChangeText={(text) => {
                    setPhone(text);
                    setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  containerStyle={styles.phoneInput}
                  textContainerStyle={styles.phoneTextInput}
                  codeTextStyle={styles.phoneCodeText}
                  flagButtonStyle={styles.phoneFlagButton}
                  textInputStyle={styles.phoneTextInputStyle}
                  placeholder="Phone number"
                  textInputProps={{
                    onFocus: () => setPhoneFocused(true),
                    onBlur: () => setPhoneFocused(false),
                    placeholderTextColor: colors.textSecondary,
                  }}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
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
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
              <Input
                label={t('signup.password')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('signup.placeholderPassword')}
                secureTextEntry
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.buttonContainer}>
              <Button
                title={t('signup.signUp')}
                onPress={handleSignUp}
                disabled={!isFormValid}
                loading={loading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>{t('signup.haveAccount') || 'Already have an account?'} </Text>
              <Pressable onPress={handleGoToLogin}>
                <Text style={styles.loginLinkPressable}>Log In</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
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
  googleSection: {
    marginBottom: 20,
  },
  googleButtonContainer: {
    marginBottom: 8,
  },
  googleIconContainer: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  phoneWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '400',
  },
  phoneInputOuterContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIconLeft: {
    paddingLeft: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 52,
    marginLeft: -10, // Pull closer to the left icon
  },
  phoneTextInput: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingLeft: 4,
  },
  phoneCodeText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  phoneFlagButton: {
    width: 60, // Increased to accommodate the arrow
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 0,
  },
  phoneTextInputStyle: {
    fontSize: 16,
    color: colors.textPrimary,
    height: 52,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 10,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  loginLinkPressable: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
