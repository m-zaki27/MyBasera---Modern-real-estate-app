import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { APP_NAME } from '@/constants/brand';

type BrandMarkProps = {
  /** Logo edge length in points. */
  size?: number;
  /** Text color variant: on a brand gradient use 'light'. */
  tone?: 'default' | 'light';
  showName?: boolean;
};

/** The MyBasera logo with the app name beside it. */
export function BrandMark({ size = 32, tone = 'default', showName = true }: BrandMarkProps) {
  return (
    <View className="flex-row items-center gap-2" accessible accessibilityLabel={APP_NAME}>
      <Image
        source={require('@/assets/images/logo.png')}
        // Size is a prop-driven runtime value.
        style={{ width: size, height: size }}
        contentFit="contain"
      />
      {showName ? (
        <Text
          className={`font-extrabold tracking-tight ${
            tone === 'light' ? 'text-white' : 'text-foreground dark:text-foreground-dark'
          } ${size >= 32 ? 'text-xl' : 'text-base'}`}>
          My<Text className={tone === 'light' ? 'text-white/80' : 'text-primary dark:text-primary-300'}>Basera</Text>
        </Text>
      ) : null}
    </View>
  );
}
