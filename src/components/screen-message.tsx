import type { ReactNode } from 'react';
import { View } from 'react-native';

import { BackButton } from '@/components/back-button';

type ScreenMessageProps = {
  children: ReactNode;
};

/** Full-screen centered state (loading / error / not found) for pushed detail screens. */
export function ScreenMessage({ children }: ScreenMessageProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-screen dark:bg-background-dark">
      <BackButton />
      {children}
    </View>
  );
}
