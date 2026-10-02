import { Link } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressableScale } from '@/components/pressable-scale';
import { PropertyCard } from '@/components/property-card';
import type { PropertyListItem } from '@/hooks/use-properties';

type PropertyCardLinkProps = {
  property: PropertyListItem;
  /** Position in the list, for a short staggered entrance (only the first few animate). */
  index?: number;
};

const ANIMATED_ITEMS = 6;

/** A property card that opens the details screen, with an entrance and press animation. */
export function PropertyCardLink({ property, index = ANIMATED_ITEMS }: PropertyCardLinkProps) {
  return (
    <Animated.View
      entering={index < ANIMATED_ITEMS ? FadeInDown.delay(index * 60).duration(400) : undefined}>
      <View className="px-screen">
        <Link href={{ pathname: '/property/[id]', params: { id: property.id } }} asChild>
          <PressableScale accessibilityRole="link" accessibilityLabel={`${property.name}, view details`}>
            <PropertyCard property={property} />
          </PressableScale>
        </Link>
      </View>
    </Animated.View>
  );
}
