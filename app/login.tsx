import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import Input from '../src/components/Input';
import Button from '../src/components/Button';

export default function Login() {
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
        setEmailError('Please enter a valid email');
        return;
      }
      Alert.alert('Success', 'Logged in successfully!');
    }, 1500);
  };

  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setEmailError('');
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
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              onPress={handleLogin}
              disabled={!isFormValid}
              loading={loading}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="secondary"
            />
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
  buttonContainer: {
    marginTop: 12,
  },
});
