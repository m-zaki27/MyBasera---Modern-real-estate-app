import { View } from 'react-native';

import type { GradientViewProps } from '@/components/gradient-view';

/** Web: react-native-web forwards `backgroundImage` to CSS. */
export function GradientView({ colors, angle = '180deg', className, style, children }: GradientViewProps) {
  return (
    <View
      className={className}
      // `backgroundImage` isn't in React Native's style types, but react-native-web passes it through.
      style={[{ backgroundImage: `linear-gradient(${angle}, ${colors.join(', ')})` } as object, style]}>
      {children}
    </View>
  );
}
