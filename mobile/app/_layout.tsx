import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Root content component that uses auth context
function RootContent() {
  const { loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();

  // Monitor auth state and route accordingly
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // User is authenticated, navigate to app
      router.replace('/(app)/index' as any);
    } else if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated, navigate to auth (login)
      router.replace('/(auth)/login' as any);
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#136dec" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

// Root layout
export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}
