import { useEffect, useCallback } from 'react';
import { Stack, useRouter, usePathname } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";

const PUBLIC_ROUTES = ['/login', '/signup'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, reauthenticate } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isRootPath = pathname === '/';

    if (isRootPath && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return null;
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
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AuthGuard>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
