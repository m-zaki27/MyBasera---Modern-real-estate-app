import '@/global.css';
import '@/lib/nativewind-interop';

import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, useColorScheme } from 'react-native';

import { SplashOverlay } from '@/components/splash-overlay';
import { useFavoritesSync } from '@/hooks/use-favorites-sync';
import { applyAppearance, loadAppearance } from '@/lib/appearance';
import { clerkPublishableKey } from '@/lib/clerk';

SplashScreen.preventAutoHideAsync();

// Expected while using a pk_test_ key; it still prints in the Metro terminal.
LogBox.ignoreLogs(['Clerk has been loaded with development keys']);

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  useFavoritesSync();

  // Re-apply the saved light/dark preference on launch.
  useEffect(() => {
    loadAppearance().then((preference) => applyAppearance(preference, false));
  }, []);

  // Keep the native splash screen up until Clerk has restored any cached session,
  // so signed-in users never see a flash of the sign-in screen.
  if (!isLoaded) return null;

  return (
    <>
      <SplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="property/[id]" />
          <Stack.Screen name="agent/[id]" />
          <Stack.Screen name="explore-filters" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="listing/new"
            options={{ headerShown: true, title: 'New listing', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="listing/[id]/edit"
            options={{ headerShown: true, title: 'Edit listing', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ headerShown: true, title: 'Edit profile', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="my-listings"
            options={{ headerShown: true, title: 'My listings', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="deals"
            options={{ headerShown: true, title: 'My deals', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="review/[dealId]"
            options={{ headerShown: true, title: 'Leave a review', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="help"
            options={{ headerShown: true, title: 'Help & support', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="about"
            options={{ headerShown: true, title: 'About', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="legal/privacy"
            options={{ headerShown: true, title: 'Privacy policy', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="legal/terms"
            options={{ headerShown: true, title: 'Terms of service', headerBackTitle: 'Back' }}
          />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="map/[id]" />
          <Stack.Screen
            name="deal/[id]"
            options={{ headerShown: true, title: 'Deal', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="offer/new"
            options={{ headerShown: true, title: 'Make an offer', headerBackTitle: 'Back' }}
          />
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
