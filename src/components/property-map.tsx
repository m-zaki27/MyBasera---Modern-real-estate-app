import { useState } from 'react';
import { Text, View } from 'react-native';

import { LeafletMap } from '@/components/leaflet-map';
import { PropertyCardLink } from '@/components/property-card-link';
import type { PropertyListItem } from '@/hooks/use-properties';
import { formatCompactPrice } from '@/lib/format';
import type { MapMarker } from '@/lib/leaflet-html';

type PropertyMapProps = {
  properties: PropertyListItem[];
};

/** Explore's map view: price pins on OpenStreetMap; tapping a pin shows that listing's card. */
export function PropertyMap({ properties }: PropertyMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const markers: MapMarker[] = properties.flatMap((property) =>
    property.latitude !== null && property.longitude !== null
      ? [
          {
            id: property.id,
            latitude: property.latitude,
            longitude: property.longitude,
            label: formatCompactPrice(property.price, property.listing_type),
          },
        ]
      : []
  );
  // If the selected listing gets filtered out, its card disappears with it.
  const selected = properties.find((property) => property.id === selectedId) ?? null;
  const unpinned = properties.length - markers.length;

  return (
    <View className="flex-1">
      <LeafletMap markers={markers} onMarkerPress={setSelectedId} onMapPress={() => setSelectedId(null)} />
      {unpinned > 0 && !selected ? (
        <View className="absolute left-0 right-0 top-3 items-center" pointerEvents="none">
          <Text className="rounded-full bg-background/90 px-3 py-1 text-xs text-muted dark:bg-background-dark/90 dark:text-muted-dark">
            {unpinned} {unpinned === 1 ? 'listing has' : 'listings have'} no map location
          </Text>
        </View>
      ) : null}
      {selected ? (
        <View className="absolute bottom-4 left-0 right-0">
          <PropertyCardLink property={selected} />
        </View>
      ) : null}
    </View>
  );
}
