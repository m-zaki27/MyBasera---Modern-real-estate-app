import { isRunningInExpoGo } from 'expo';
import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { PropertyListItem } from '@/hooks/use-properties';

type PropertyMapProps = {
  properties: PropertyListItem[];
};

function DevelopmentBuildRequired({ properties }: PropertyMapProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-screen">
      <SymbolView
        name={{ ios: 'map', android: 'map', web: 'map' }}
        tintColor={colors.muted.DEFAULT}
        size={40}
      />
      <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
        The map needs the development build
      </Text>
      <Text className="text-center text-sm text-muted dark:text-muted-dark">
        Expo Go doesn&apos;t include MapLibre. {properties.length}{' '}
        {properties.length === 1 ? 'listing matches' : 'listings match'} your filters — switch to
        List to browse them here.
      </Text>
    </View>
  );
}

/**
 * MapLibre's native module isn't in Expo Go, and importing it there throws, so it's only
 * required when running in a development or production build.
 */
export function PropertyMap({ properties }: PropertyMapProps) {
  if (isRunningInExpoGo()) {
    return <DevelopmentBuildRequired properties={properties} />;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MapLibrePropertyMap } = require('./maplibre-property-map') as typeof import('./maplibre-property-map');
  return <MapLibrePropertyMap properties={properties} />;
}
