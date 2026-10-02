import * as SecureStore from 'expo-secure-store';
import { colorScheme } from 'nativewind';
import { Platform } from 'react-native';

export type AppearancePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'mybasera.appearance';

// Web follows the browser's prefers-color-scheme (NativeWind's media strategy), and
// SecureStore isn't available there, so the preference is native-only.
export const canChangeAppearance = Platform.OS !== 'web';

export async function loadAppearance(): Promise<AppearancePreference> {
  if (!canChangeAppearance) return 'system';
  const stored = await SecureStore.getItemAsync(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** Applies a light/dark/system preference app-wide (NativeWind + React Native Appearance) and saves it. */
export async function applyAppearance(preference: AppearancePreference, persist = true): Promise<void> {
  if (!canChangeAppearance) return;
  colorScheme.set(preference);
  if (persist) await SecureStore.setItemAsync(STORAGE_KEY, preference);
}
