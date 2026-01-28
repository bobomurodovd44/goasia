import { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter, usePathname } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";

const PUBLIC_ROUTES = ['/login', '/signup', '/company-form'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isRootPath = pathname === '/';

  useEffect(() => {
    if (isLoading) return;

    console.log('[AuthGuard] checkAuth - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'pathname:', pathname);

    if (isRootPath && !isAuthenticated) {
      console.log('[AuthGuard] Root path, not authenticated - redirecting to login');
      router.replace('/login');
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      console.log('[AuthGuard] Not authenticated, not public route - redirecting to login');
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isPublicRoute && pathname !== '/company-form') {
      console.log('[AuthGuard] Authenticated, public route - redirecting to tabs');
      router.replace('/(tabs)');
      return;
    }

    console.log('[AuthGuard] Rendering route:', pathname);
  }, [isAuthenticated, isLoading, pathname, router, isPublicRoute, isRootPath]);

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
