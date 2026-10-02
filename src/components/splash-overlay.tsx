import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { useColorScheme, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { SPLASH_BACKGROUND } from '@/constants/brand';

/**
 * Continues the native splash screen (same logo and background) inside React, then
 * fades out once the first screen has laid out, so there's no hard cut on launch.
 */
export function SplashOverlay() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <View
      // Absolute fill + colour come from the native splash config; NativeWind can't read it.
      style={{ backgroundColor: SPLASH_BACKGROUND[scheme] }}
      className="absolute inset-0 z-50 items-center justify-center"
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setHidden(true);
          // Unmount after the fade-out below has finished.
          setTimeout(() => setVisible(false), 450);
        });
      }}>
      {hidden ? null : (
        <Animated.View exiting={FadeOut.duration(400)}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            className="h-40 w-40"
            contentFit="contain"
            accessibilityLabel="MyBasera"
          />
        </Animated.View>
      )}
    </View>
  );
}
