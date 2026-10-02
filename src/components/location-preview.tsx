import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, Text, View } from 'react-native';

import { LeafletMap } from '@/components/leaflet-map';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { getGoogleMapsUrl } from '@/lib/maps';

type LocationPreviewProps = {
  propertyId: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

/** "Location" panel on a listing: address + a small map that opens the full-screen map. */
export function LocationPreview({ propertyId, address, latitude, longitude }: LocationPreviewProps) {
  const hasCoords = latitude !== null && longitude !== null;

  return (
    <View className="gap-3">
      <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">Location</Text>
      <View className="flex-row items-start gap-2">
        <SymbolView
          name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
          tintColor={colors.primary.DEFAULT}
          size={18}
        />
        <Text className="flex-1 text-sm leading-5 text-foreground dark:text-foreground-dark">{address}</Text>
      </View>

      {hasCoords ? (
        <Pressable
          onPress={() => router.push({ pathname: '/map/[id]', params: { id: propertyId } })}
          accessibilityRole="button"
          accessibilityLabel={`Map of ${address}. Opens the full-screen map`}
          className="h-48 overflow-hidden rounded-card border border-border active:opacity-90 dark:border-border-dark">
          <LeafletMap
            markers={[{ id: propertyId, latitude, longitude }]}
            interactive={false}
            singleMarkerZoom={14}
          />
          <View
            className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 dark:bg-background-dark/95"
            pointerEvents="none">
            <SymbolView
              name={{
                ios: 'arrow.up.left.and.arrow.down.right',
                android: 'open_in_full',
                web: 'open_in_full',
              }}
              tintColor={colors.primary.DEFAULT}
              size={14}
            />
            <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark">
              Tap to view full map
            </Text>
          </View>
        </Pressable>
      ) : (
        <View className="gap-3 rounded-card bg-surface p-4 dark:bg-surface-dark">
          <Text className="text-sm text-muted dark:text-muted-dark">
            The exact location isn’t pinned on the map yet.
          </Text>
          <PrimaryButton
            title="Search in Google Maps"
            variant="outline"
            onPress={() => Linking.openURL(getGoogleMapsUrl({ address, latitude, longitude }))}
          />
        </View>
      )}
    </View>
  );
}
