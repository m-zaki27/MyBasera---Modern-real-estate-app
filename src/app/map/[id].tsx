import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Linking, Pressable, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LeafletMap } from '@/components/leaflet-map';
import { colors } from '@/constants/colors';
import { useProperty } from '@/hooks/use-property';
import { getGoogleMapsUrl } from '@/lib/maps';

/** Full-screen map for one listing: address on top, "Open in Google Maps" on the right. */
export default function PropertyMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { property, loading } = useProperty(id);
  const isDark = useColorScheme() === 'dark';

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View className="flex-row items-center gap-3 border-b border-border px-3 py-2.5 dark:border-border-dark">
          <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8} className="p-1">
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor={isDark ? colors.foreground.dark : colors.foreground.DEFAULT}
              size={22}
            />
          </Pressable>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground dark:text-foreground-dark" numberOfLines={1}>
              {property?.name ?? 'Location'}
            </Text>
            <Text className="text-xs text-muted dark:text-muted-dark" numberOfLines={2}>
              {property?.address ?? ''}
            </Text>
          </View>
          {property ? (
            <Pressable
              onPress={() => Linking.openURL(getGoogleMapsUrl(property))}
              accessibilityRole="link"
              accessibilityLabel="Open in Google Maps"
              accessibilityHint="Opens Google Maps outside the app"
              className="flex-row items-center gap-1.5 rounded-full bg-primary px-3 py-2 active:opacity-80">
              <SymbolView
                name={{ ios: 'arrow.up.right.square', android: 'open_in_new', web: 'open_in_new' }}
                tintColor={colors.white}
                size={14}
              />
              <Text className="text-xs font-semibold text-white">Google Maps</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary.DEFAULT} />
          </View>
        ) : property && property.latitude !== null && property.longitude !== null ? (
          <LeafletMap
            markers={[{ id: property.id, latitude: property.latitude, longitude: property.longitude }]}
            singleMarkerZoom={16}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-screen">
            <Text className="text-center text-sm text-muted dark:text-muted-dark">
              This listing’s exact location isn’t pinned. Use “Google Maps” to search the address.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
