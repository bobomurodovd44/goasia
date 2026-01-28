import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import Button from '../src/components/Button';
import Input from '../src/components/Input';
import { useAuth } from '../src/contexts/AuthContext';
import '../src/i18n';
import { colors } from '../src/theme/colors';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.length > 0 && password.length > 0;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError(t('login.validationEmail') || 'Invalid email address');
      return;
    }

    setLoading(true);
    setEmailError('');

    try {
      console.log('[Login] Attempting login for:', email);
      await login(email, password);
      console.log('[Login] Success, navigating to tabs...');
    } catch (error: any) {
      console.log('[Login] Error caught:', error);
      console.log('[Login] Error code:', error.code);
      console.log('[Login] Error message:', error.message);
      
      let errorMessage = t('login.errorMessage') || 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = t('login.invalidCredentials') || 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('login.invalidEmail') || 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = t('login.tooManyRequests') || 'Too many attempts. Please try again later.';
      } else if (error.message?.includes('role')) {
        errorMessage = t('login.wrongRole') || 'This account is not authorized for company login';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(t('login.errorTitle') || 'Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert(t('login.comingSoon') || 'Coming Soon', 'Google Sign-In will be available soon.');
  };

  const handleForgotPassword = () => {
    Alert.alert(t('login.forgotPasswordTitle') || 'Forgot Password', t('login.forgotPasswordMessage') || 'Reset link sent');
  };

  const handleSignUp = () => {
    router.push('/signup');
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
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
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
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('login.or') || 'OR'}</Text>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Input
              label={t('login.email')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              placeholder={t('login.placeholderEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Input
              label={t('login.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('login.placeholderPassword')}
              secureTextEntry
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(450).duration(500)}>
            <Pressable 
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>{t('login.forgotPassword') || 'Forgot password?'}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <View style={styles.buttonContainer}>
              <Button
                title={t('login.login') || 'Log In'}
                onPress={handleLogin}
                disabled={!isFormValid}
                loading={loading}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>{t('login.noAccount') || "Don't have an account?"} </Text>
              <Pressable onPress={handleSignUp}>
                <Text style={styles.signUpLink}>{t('login.signUp') || 'Sign Up'}</Text>
              </Pressable>
            </View>
          </Animated.View>
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
    marginVertical: 24,
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
  buttonContainer: {
    marginTop: 12,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
    padding: 8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  signUpText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
