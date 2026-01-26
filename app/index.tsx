import { Text, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import '../src/i18n';

export default function Index() {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>{t('hello')}</Text>
      <Pressable
        onPress={() => router.push('/login')}
        style={{ marginTop: 20, padding: 10 }}
      >
        <Text>Go to Login</Text>
      </Pressable>
    </View>
  );
}
