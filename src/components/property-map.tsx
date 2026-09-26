import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { PropertyCardLink } from '@/components/property-card-link';
import { colors } from '@/constants/colors';
import type { PropertyListItem } from '@/hooks/use-properties';

type PropertyMapProps = {
  properties: PropertyListItem[];
};

type LocatedProperty = PropertyListItem & { latitude: number; longitude: number };

const EDGE_PADDING = { top: 80, right: 60, bottom: 80, left: 60 };

// Continental US, used when there are no pins to frame.
const DEFAULT_REGION: Region = {
  latitude: 37.5,
  longitude: -96,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

function isLocated(property: PropertyListItem): property is LocatedProperty {
  return property.latitude !== null && property.longitude !== null;
}

/** Region that frames every pin, so the map opens in the right place without an imperative fit. */
function regionFor(points: LocatedProperty[]): Region {
  if (points.length === 0) return DEFAULT_REGION;
  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.05),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.05),
  };
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<MapView>(null);
  const isReadyRef = useRef(false);
  const fittedKeyRef = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const located = properties.filter(isLocated);
  // If the selected listing gets filtered out, its card disappears with it.
  const selected = located.find((property) => property.id === selectedId) ?? null;
  const pinsKey = located.map((property) => property.id).join(',');

  // Frame the pins once the native map has laid out (fitting a map with no size yet
  // fails on Android), and again whenever filters change which pins are shown.
  const fitToPins = (animated: boolean) => {
    if (!isReadyRef.current || located.length === 0 || fittedKeyRef.current === pinsKey) return;
    fittedKeyRef.current = pinsKey;
    mapRef.current?.fitToCoordinates(
      located.map(({ latitude, longitude }) => ({ latitude, longitude })),
      { edgePadding: EDGE_PADDING, animated }
    );
  };

  useEffect(() => {
    fitToPins(true);
    // `pinsKey` captures everything about the pins that matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsKey]);

  return (
    <View className="flex-1 overflow-hidden">
      <MapView
        ref={mapRef}
        // Google Maps on Android (needs the API key from app.config.ts); Apple Maps on iOS.
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        // Absolute fill (rather than flex) gives the native map a concrete size on Android.
        style={StyleSheet.absoluteFill}
        initialRegion={regionFor(located)}
        onMapReady={() => {
          isReadyRef.current = true;
          fitToPins(false);
        }}
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
