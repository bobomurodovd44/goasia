import { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter, usePathname } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet, View, Text, Alert } from "react-native";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { useSignupWizard } from "../src/store/signupWizard";

const PUBLIC_ROUTES = ['/login', '/signup', '/company-form'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const signupStore = useSignupWizard();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isRootPath = pathname === '/';
  const isCompanyForm = pathname === '/company-form';

  useEffect(() => {
    if (isLoading) return;

    if (isRootPath && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isPublicRoute && !isCompanyForm) {
      router.replace('/(tabs)');
      return;
    }

    if (isAuthenticated && isCompanyForm) {
      if (!signupStore.step1Completed) {
        router.replace('/signup');
        return;
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, isPublicRoute, isRootPath, isCompanyForm, signupStore.step1Completed]);

  if (isLoading && !isPublicRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AuthGuard>
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: false,
              }}
            >
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="company-form" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AuthGuard>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
