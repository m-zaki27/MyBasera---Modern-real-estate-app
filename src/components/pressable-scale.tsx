import type { Ref } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps, type View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type PressableScaleProps = PressableProps & {
  className?: string;
  /** How far to shrink while pressed (default 0.97). */
  scaleTo?: number;
  ref?: Ref<View>;
};

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

/**
 * Pressable that springs down slightly while pressed — tactile feedback for cards and
 * buttons. Works as a `Link asChild` child (forwards onPress/href props and ref).
 */
export function PressableScale({ scaleTo = 0.97, onPressIn, onPressOut, children, ref, ...props }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        ref={ref}
        {...props}
        onPressIn={(event: GestureResponderEvent) => {
          scale.set(withSpring(scaleTo, SPRING));
          onPressIn?.(event);
        }}
        onPressOut={(event: GestureResponderEvent) => {
          scale.set(withSpring(1, SPRING));
          onPressOut?.(event);
        }}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
