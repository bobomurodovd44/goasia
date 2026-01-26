import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

interface DividerProps {
  textKey?: string;
}

export default function Divider({ textKey = 'login.or' }: DividerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{t(textKey)}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  text: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
