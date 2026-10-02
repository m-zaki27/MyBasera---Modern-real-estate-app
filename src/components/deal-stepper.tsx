import { Text, View } from 'react-native';

import { DEAL_STEPS } from '@/lib/deal-flow';

type DealStepperProps = {
  /** Index of the step in progress; earlier steps render as done. */
  current: number;
  /** A closed deal (declined/withdrawn/cancelled) shows its stopping point in red. */
  stopped?: boolean;
};

export function DealStepper({ current, stopped = false }: DealStepperProps) {
  return (
    <View className="flex-row items-start" accessible accessibilityLabel={`Step ${Math.min(current + 1, DEAL_STEPS.length)} of ${DEAL_STEPS.length}: ${DEAL_STEPS[Math.min(current, DEAL_STEPS.length - 1)]}`}>
      {DEAL_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const circle = done
          ? 'bg-primary border-primary'
          : active
            ? stopped
              ? 'bg-danger border-danger'
              : 'bg-background border-primary dark:bg-background-dark'
            : 'bg-background border-border dark:bg-background-dark dark:border-border-dark';
        return (
          <View key={label} className="flex-1 items-center gap-1.5">
            <View className="w-full flex-row items-center">
              <View className={`h-0.5 flex-1 ${index === 0 ? 'bg-transparent' : done || active ? 'bg-primary' : 'bg-border dark:bg-border-dark'}`} />
              <View className={`h-7 w-7 items-center justify-center rounded-full border-2 ${circle}`}>
                <Text
                  className={`text-xs font-bold ${done || (active && stopped) ? 'text-white' : active ? 'text-primary dark:text-primary-300' : 'text-muted dark:text-muted-dark'}`}>
                  {done ? '✓' : index + 1}
                </Text>
              </View>
              <View
                className={`h-0.5 flex-1 ${index === DEAL_STEPS.length - 1 ? 'bg-transparent' : done ? 'bg-primary' : 'bg-border dark:bg-border-dark'}`}
              />
            </View>
            <Text
              className={`text-center text-[11px] ${active ? 'font-semibold text-foreground dark:text-foreground-dark' : 'text-muted dark:text-muted-dark'}`}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
