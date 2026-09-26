import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { PropertySpecs } from '@/components/property-specs';
import { colors } from '@/constants/colors';
import type { PropertyListItem } from '@/hooks/use-properties';
import { formatPrice } from '@/lib/format';

type PropertyCardProps = {
  property: PropertyListItem;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const { name, type, price, address, bedrooms, bathrooms, area, rating, image_url } = property;

  return (
    <View className="overflow-hidden rounded-card border border-border bg-background dark:border-border-dark dark:bg-surface-dark">
      <View>
        <Image
          source={image_url ? { uri: image_url } : undefined}
          className="aspect-[16/10] w-full bg-surface dark:bg-border-dark"
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
        <View className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 dark:bg-background-dark/90">
          <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark">{type}</Text>
        </View>
        <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 dark:bg-background-dark/90">
          <SymbolView
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            tintColor={colors.rating.DEFAULT}
            size={12}
          />
          <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark">
            {rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View className="gap-1.5 p-4">
        <View className="flex-row items-baseline justify-between gap-3">
          <Text
            className="flex-1 text-lg font-bold text-foreground dark:text-foreground-dark"
            numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-lg font-bold text-primary">{formatPrice(price)}</Text>
        </View>
        <Text className="text-sm text-muted dark:text-muted-dark" numberOfLines={1}>
          {address}
        </Text>
        <View className="mt-1">
          <PropertySpecs bedrooms={bedrooms} bathrooms={bathrooms} area={area} />
        </View>
      </View>
    </View>
  );
}
