import '@/global.css';
import '@/lib/nativewind-interop';

import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useFavoritesSync } from '@/hooks/use-favorites-sync';
import { clerkPublishableKey } from '@/lib/clerk';

SplashScreen.preventAutoHideAsync();

// Expected while using a pk_test_ key; it still prints in the Metro terminal.
LogBox.ignoreLogs(['Clerk has been loaded with development keys']);

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  useFavoritesSync();

  // Keep the native splash screen up until Clerk has restored any cached session,
  // so signed-in users never see a flash of the sign-in screen.
  if (!isLoaded) return null;

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="property/[id]" />
          <Stack.Screen name="agent/[id]" />
          <Stack.Screen name="explore-filters" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </ThemeProvider>
    </ClerkProvider>
  );
}
