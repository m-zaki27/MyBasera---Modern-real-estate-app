import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { GradientView } from '@/components/gradient-view';
import { PropertySpecs } from '@/components/property-specs';
import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/colors';
import type { PropertyListItem } from '@/hooks/use-properties';
import { formatPrice } from '@/lib/format';

type PropertyCardProps = {
  property: PropertyListItem;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const { id, name, type, listing_type, status, price, address, bedrooms, bathrooms, area, rating, image_url } =
    property;

  return (
    <View className="overflow-hidden rounded-card border border-border bg-background shadow-md shadow-black/10 dark:border-border-dark dark:bg-surface-dark">
      <View>
        <Image
          source={image_url ? { uri: image_url } : undefined}
          className="aspect-[16/10] w-full bg-surface dark:bg-border-dark"
          contentFit="cover"
          transition={250}
          accessibilityIgnoresInvertColors
        />
        {/* Darken the bottom of the photo so the price and badges stay legible on any image. */}
        <GradientView
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
          className="absolute bottom-0 left-0 right-0 h-24"
        />
        <View className="absolute left-3 top-3 flex-row gap-2">
          <View className="rounded-full bg-background/90 px-3 py-1 dark:bg-background-dark/90">
            <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark">{type}</Text>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 dark:bg-background-dark/90">
            <SymbolView
              name={{ ios: 'star.fill', android: 'star', web: 'star' }}
              tintColor={colors.rating.DEFAULT}
              size={12}
            />
            <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark">
              {rating > 0 ? rating.toFixed(1) : 'New'}
            </Text>
          </View>
        </View>
        <View className="absolute right-3 top-3">
          <FavoriteButton propertyId={id} propertyName={name} />
        </View>
        <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between gap-2">
          <Text className="text-xl font-extrabold text-white" numberOfLines={1}>
            {formatPrice(price, listing_type)}
          </Text>
          <StatusBadge status={status} />
        </View>
      </View>

      <View className="gap-1.5 p-4">
        <Text className="text-lg font-bold text-foreground dark:text-foreground-dark" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center gap-1">
          <SymbolView
            name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
            tintColor={colors.muted.DEFAULT}
            size={13}
          />
          <Text className="flex-1 text-sm text-muted dark:text-muted-dark" numberOfLines={1}>
            {address}
          </Text>
        </View>
        <View className="mt-1 border-t border-border pt-3 dark:border-border-dark">
          <PropertySpecs bedrooms={bedrooms} bathrooms={bathrooms} area={area} />
        </View>
      </View>
    </View>
  );
}
