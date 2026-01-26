import React, { useState } from 'react';
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
import { AntDesign } from '@expo/vector-icons';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { colors } from '../src/theme/colors';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.length > 0 && password.length > 0;

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!email.includes('@')) {
        setEmailError(t('login.validationEmail'));
        return;
      }
      Alert.alert(t('login.successTitle'), t('login.successMessage'));
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign-In pressed');
  };

  const handleForgotPassword = () => {
    Alert.alert(t('login.forgotPasswordTitle'), t('login.forgotPasswordMessage'));
  };

  const handleSignUp = () => {
    import('expo-router').then(({ router }) => {
      router.push('/signup');
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
          <View style={styles.googleButtonContainer}>
            <Button
              title={t('login.continueWithGoogle')}
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
            <Text style={styles.dividerText}>{t('login.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

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
          
          <Input
            label={t('login.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('login.placeholderPassword')}
            secureTextEntry
          />

          <Pressable 
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
          </Pressable>

          <View style={styles.buttonContainer}>
            <Button
              title={t('login.login')}
              onPress={handleLogin}
              disabled={!isFormValid}
              loading={loading}
            />
          </View>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>{t('login.noAccount')} </Text>
            <Pressable onPress={handleSignUp}>
              <Text style={styles.signUpLink}>{t('login.signUp')}</Text>
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
