import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

/** Floating back button for header-less screens; falls back to Home on a cold deep link. */
export function BackButton() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      // Offset below the status bar; the inset is a runtime value NativeWind can't express.
      style={{ top: insets.top + 8 }}
      className="absolute left-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-background/90 dark:bg-background-dark/90">
      <SymbolView
        name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
        tintColor={isDark ? colors.foreground.dark : colors.foreground.DEFAULT}
        size={20}
      />
    </Pressable>
  );
}
