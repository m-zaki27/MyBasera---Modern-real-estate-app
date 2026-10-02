import { ActivityIndicator, Text } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { colors } from '@/constants/colors';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** `outline` is for secondary actions (e.g. sign out) next to a solid primary action. */
  variant?: 'solid' | 'outline';
};

const containerClasses = {
  solid: 'bg-primary active:bg-primary-600',
  outline:
    'border border-border bg-background active:bg-surface dark:border-border-dark dark:bg-background-dark dark:active:bg-surface-dark',
} as const;

const textClasses = {
  solid: 'text-white',
  outline: 'text-foreground dark:text-foreground-dark',
} as const;

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center rounded-field py-3.5 ${containerClasses[variant]} ${isDisabled ? 'opacity-50' : ''}`}>
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? colors.white : colors.primary.DEFAULT} />
      ) : (
        <Text className={`text-base font-semibold ${textClasses[variant]}`}>{title}</Text>
      )}
    </PressableScale>
  );
}
