import { Link } from 'expo-router';
import { Pressable } from 'react-native';

import { PropertyCard } from '@/components/property-card';
import type { PropertyListItem } from '@/hooks/use-properties';

type PropertyCardLinkProps = {
  property: PropertyListItem;
};

/** A property card that opens the details screen. */
export function PropertyCardLink({ property }: PropertyCardLinkProps) {
  return (
    <Link href={{ pathname: '/property/[id]', params: { id: property.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${property.name}, view details`}
        className="px-screen active:opacity-80">
        <PropertyCard property={property} />
      </Pressable>
    </Link>
  );
}
