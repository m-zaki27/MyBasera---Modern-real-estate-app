import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { PropertyCardLink } from '@/components/property-card-link';
import { colors } from '@/constants/colors';
import type { PropertyListItem } from '@/hooks/use-properties';

type PropertyMapProps = {
  properties: PropertyListItem[];
};

type LocatedProperty = PropertyListItem & { latitude: number; longitude: number };

const EDGE_PADDING = { top: 80, right: 60, bottom: 80, left: 60 };

// Continental US, used until there are pins to fit.
const INITIAL_REGION = {
  latitude: 37.5,
  longitude: -96,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

function isLocated(property: PropertyListItem): property is LocatedProperty {
  return property.latitude !== null && property.longitude !== null;
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const located = properties.filter(isLocated);
  // If the selected listing gets filtered out, its card disappears with it.
  const selected = located.find((property) => property.id === selectedId) ?? null;
  const coordinatesKey = located.map((property) => property.id).join(',');

  const fitToPins = useCallback(() => {
    if (located.length === 0) return;
    mapRef.current?.fitToCoordinates(
      located.map(({ latitude, longitude }) => ({ latitude, longitude })),
      { edgePadding: EDGE_PADDING, animated: true }
    );
    // Refit only when the set of pins changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinatesKey]);

  useEffect(() => {
    fitToPins();
  }, [fitToPins]);

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        // MapView isn't className-aware; it only needs to fill its container.
        style={{ flex: 1 }}
        initialRegion={INITIAL_REGION}
        onMapReady={fitToPins}
        onPress={() => setSelectedId(null)}>
        {located.map((property) => (
          <Marker
            key={property.id}
            identifier={property.id}
            coordinate={{ latitude: property.latitude, longitude: property.longitude }}
            title={property.name}
            pinColor={property.id === selectedId ? colors.danger.DEFAULT : colors.primary.DEFAULT}
            onPress={() => setSelectedId(property.id)}
          />
        ))}
      </MapView>
      {selected ? (
        <View className="absolute bottom-4 left-0 right-0">
          <PropertyCardLink property={selected} />
        </View>
      ) : null}
    </View>
  );
}
