import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  textStyle?: TextStyle;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  textStyle,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const baseStyle = styles.button;
    const variantStyle = variant === 'primary' 
      ? styles.primaryButton 
      : styles.secondaryButton;
    const disabledStyle = isDisabled ? styles.disabledButton : null;
    
    return StyleSheet.flatten([baseStyle, variantStyle, disabledStyle]);
  };

  const getTextStyle = () => {
    const baseStyle = styles.buttonText;
    const variantStyle = variant === 'primary'
      ? styles.primaryText
      : styles.secondaryText;
    const disabledStyle = isDisabled ? styles.disabledText : null;
    
    return StyleSheet.flatten([baseStyle, variantStyle, disabledStyle]);
  };

  return (
    <Pressable
      style={({ pressed }) => {
        const pressedStyle = pressed && !isDisabled ? styles.pressed : null;
        return StyleSheet.flatten([getButtonStyle(), style, pressedStyle]);
      }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.textPrimary} />
      ) : (
        <View style={styles.contentRow}>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: colors.disabledBackground,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  disabledText: {
    color: colors.disabled,
  },
});
