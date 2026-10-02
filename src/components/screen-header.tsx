import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Optional control on the right (e.g. a filter button). */
  right?: ReactNode;
};

/** Consistent large title for tab screens, with the small logo mark above it. */
export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    // Reanimated handles the entrance; NativeWind classes live on the inner View.
    <Animated.View entering={FadeInDown.duration(350)}>
      <View className="gap-1 px-screen pb-3 pt-2">
        <BrandMark size={22} />
        <View className="flex-row items-end justify-between gap-3 pt-2">
          <View className="flex-1 gap-0.5">
            <Text className="text-3xl font-extrabold tracking-tight text-foreground dark:text-foreground-dark">
              {title}
            </Text>
            {subtitle ? <Text className="text-sm text-muted dark:text-muted-dark">{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      </View>
    </Animated.View>
  );
}
