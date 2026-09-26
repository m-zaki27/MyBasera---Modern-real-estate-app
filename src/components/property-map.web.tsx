import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { PropertyListItem } from '@/hooks/use-properties';

type PropertyMapProps = {
  properties: PropertyListItem[];
};

// MapLibre React Native is Android/iOS only, so web gets a pointer to the apps instead.
export function PropertyMap({ properties }: PropertyMapProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-screen">
      <SymbolView name={{ web: 'map' }} tintColor={colors.muted.DEFAULT} size={40} />
      <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
        Map view is available in the iOS and Android apps
      </Text>
      <Text className="text-center text-sm text-muted dark:text-muted-dark">
        {properties.length} {properties.length === 1 ? 'listing matches' : 'listings match'} your
        filters. Switch to List to browse them here.
      </Text>
    </View>
  );
}
