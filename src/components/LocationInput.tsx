import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface LocationInputProps {
  label: string;
  value: string;
  onPress: () => void;
  placeholder?: string;
  loading?: boolean;
}

export default function LocationInput({
  label,
  value,
  onPress,
  placeholder,
  loading,
}: LocationInputProps) {
  const displayValue = value || placeholder || 'Select address';
  const hasValue = value && value.length > 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <Pressable
          style={[
            styles.inputContainer,
            hasValue && styles.inputContainerActive,
          ]}
          onPress={onPress}
          disabled={loading}
        >
          <View style={styles.inputContent}>
            <Ionicons
              name="location"
              size={18}
              color={hasValue ? colors.primary : colors.disabled}
            />
            <Text
              style={[
                styles.inputText,
                !hasValue && styles.inputTextPlaceholder,
              ]}
              numberOfLines={1}
            >
              {displayValue}
            </Text>
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Getting location...</Text>
          ) : (
            <View style={styles.buttonWrapper}>
              <Text style={styles.selectButtonText}>
                {hasValue ? 'Change' : 'Select'}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
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
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputContainerActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  inputTextPlaceholder: {
    color: colors.disabled,
  },
  buttonWrapper: {
    marginLeft: 12,
  },
  selectButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
});
