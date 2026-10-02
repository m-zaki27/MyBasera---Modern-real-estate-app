import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type GradientViewProps = {
  /** CSS-style color stops, top to bottom unless `angle` is given. */
  colors: readonly string[];
  /** CSS angle, e.g. '180deg' (top → bottom, the default) or '135deg'. */
  angle?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Linear gradient using React Native's built-in `experimental_backgroundImage` (New
 * Architecture), so no gradient library is needed. Web uses CSS in gradient-view.web.tsx.
 */
export function GradientView({ colors, angle = '180deg', className, style, children }: GradientViewProps) {
  return (
    <View
      className={className}
      style={[{ experimental_backgroundImage: `linear-gradient(${angle}, ${colors.join(', ')})` }, style]}>
      {children}
    </View>
  );
}
