import React, { useState, useRef } from 'react';
import { 
  Text, 
  TextInput, 
  View, 
  StyleSheet, 
  TextInputProps,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  disabled,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  const togglePasswordVisibility = (e: GestureResponderEvent) => {
    e.stopPropagation();
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (focused) return colors.focus;
    return colors.border;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={handlePress}
        hitSlop={12}
        disabled={disabled}
        style={({ pressed }) => [
          styles.pressableWrapper,
          { opacity: pressed && !disabled ? 0.9 : 1 },
        ]}
      >
        <View style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
        ]}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { opacity: disabled ? 0.5 : 1 },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            editable={!disabled}
            placeholderTextColor={colors.textSecondary}
            {...props}
          />
          {secureTextEntry && (
            <Pressable 
              onPress={togglePasswordVisibility}
              style={styles.toggleIcon}
              hitSlop={8}
            >
              <Ionicons 
                name={isPasswordVisible ? 'eye-off' : 'eye'} 
                size={20} 
                color={colors.textSecondary} 
              />
            </Pressable>
          )}
        </View>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '400',
  },
  pressableWrapper: {
    borderRadius: 12,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 40,
    fontSize: 16,
    color: colors.textPrimary,
  },
  toggleIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
    fontWeight: '500',
  },
});
