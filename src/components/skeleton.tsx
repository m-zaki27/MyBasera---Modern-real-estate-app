import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SkeletonProps = {
  className?: string;
};

/** A pulsing placeholder block shown while content loads. */
export function Skeleton({ className = '' }: SkeletonProps) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style}>
      <View className={`rounded-lg bg-border dark:bg-border-dark ${className}`} />
    </Animated.View>
  );
}

/** Placeholder shaped like a PropertyCard. */
export function PropertyCardSkeleton() {
  return (
    <View className="mx-screen overflow-hidden rounded-card border border-border dark:border-border-dark">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <View className="gap-2.5 p-4">
        <View className="flex-row justify-between gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-24" />
        </View>
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-36" />
      </View>
    </View>
  );
}
