import {
  Camera,
  Map as MapLibreMap,
  Marker,
  type CameraRef,
  type LngLatBounds,
} from '@maplibre/maplibre-react-native';
import { useEffect, useRef, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';

import { PropertyCardLink } from '@/components/property-card-link';
import type { PropertyListItem } from '@/hooks/use-properties';
import { formatCompactPrice } from '@/lib/format';

type PropertyMapProps = {
  properties: PropertyListItem[];
};

type LocatedProperty = PropertyListItem & { latitude: number; longitude: number };

// OpenFreeMap: free vector tiles with no API key, no usage limits, commercial use allowed.
// MapLibre adds the required OpenStreetMap attribution automatically.
const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;

const PADDING = { top: 80, right: 60, bottom: 80, left: 60 };

// Continental US, used when there are no pins to frame.
const DEFAULT_BOUNDS: LngLatBounds = [-125, 24, -66, 50];

function isLocated(property: PropertyListItem): property is LocatedProperty {
  return property.latitude !== null && property.longitude !== null;
}

function boundsFor(points: LocatedProperty[]): LngLatBounds {
  if (points.length === 0) return DEFAULT_BOUNDS;
  const lngs = points.map((point) => point.longitude);
  const lats = points.map((point) => point.latitude);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

type PricePinProps = {
  property: LocatedProperty;
  selected: boolean;
};

function PricePin({ property, selected }: PricePinProps) {
  return (
    <View
      className={`rounded-full border px-2.5 py-1 ${
        selected ? 'border-primary bg-primary' : 'border-border bg-background'
      }`}>
      <Text className={`text-xs font-bold ${selected ? 'text-white' : 'text-foreground'}`}>
        {formatCompactPrice(property.price, property.listing_type)}
      </Text>
    </View>
  );
}

export function MapLibrePropertyMap({ properties }: PropertyMapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const isDark = useColorScheme() === 'dark';
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const located = properties.filter(isLocated);
  // If the selected listing gets filtered out, its card disappears with it.
  const selected = located.find((property) => property.id === selectedId) ?? null;
  const pinsKey = located.map((property) => property.id).join(',');

  // The first frame comes from initialViewState; re-frame only when filters change
  // which pins are shown (not on every render, so panning isn't undone).
  const framedKeyRef = useRef(pinsKey);
  useEffect(() => {
    if (framedKeyRef.current === pinsKey || located.length === 0) return;
    framedKeyRef.current = pinsKey;
    cameraRef.current?.fitBounds(boundsFor(located), { padding: PADDING, duration: 600 });
    // `pinsKey` captures everything about the pins that matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsKey]);

  return (
    <View className="flex-1 overflow-hidden">
      <MapLibreMap
        // Map isn't className-aware; it only needs to fill its container.
        style={{ flex: 1 }}
        mapStyle={isDark ? MAP_STYLES.dark : MAP_STYLES.light}
        onPress={() => setSelectedId(null)}>
        <Camera
          ref={cameraRef}
          initialViewState={{ bounds: boundsFor(located), padding: PADDING }}
        />
        {located.map((property) => (
          <Marker
            key={property.id}
            id={property.id}
            lngLat={[property.longitude, property.latitude]}
            anchor="center"
            onPress={() => setSelectedId(property.id)}>
            <PricePin property={property} selected={property.id === selectedId} />
          </Marker>
        ))}
      </MapLibreMap>
      {selected ? (
        <View className="absolute bottom-4 left-0 right-0">
          <PropertyCardLink property={selected} />
        </View>
      ) : null}
    </View>
  );
}
