import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/colors';
import type { PropertyListItem } from '@/hooks/use-properties';
import { formatPrice } from '@/lib/format';

type MyListingRowProps = {
  listing: PropertyListItem;
};

/** Compact row for the owner's own listings; opens the edit screen. */
export function MyListingRow({ listing }: MyListingRowProps) {
  return (
    <Link href={{ pathname: '/listing/[id]/edit', params: { id: listing.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${listing.name}`}
        className="flex-row items-center gap-3 rounded-card border border-border p-3 active:opacity-80 dark:border-border-dark">
        <Image
          source={listing.image_url ? { uri: listing.image_url } : undefined}
          className="h-16 w-20 rounded-field bg-surface dark:bg-surface-dark"
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
        <View className="flex-1 gap-0.5">
          <Text
            className="text-base font-semibold text-foreground dark:text-foreground-dark"
            numberOfLines={1}>
            {listing.name}
          </Text>
          <Text className="text-sm font-semibold text-primary dark:text-primary-300">
            {formatPrice(listing.price, listing.listing_type)}
          </Text>
          <Text className="text-xs text-muted dark:text-muted-dark" numberOfLines={1}>
            {listing.address}
          </Text>
        </View>
        <StatusBadge status={listing.status} />
        <SymbolView
          name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
          tintColor={colors.muted.DEFAULT}
          size={18}
        />
      </Pressable>
    </Link>
  );
}
