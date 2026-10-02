import { useId, useMemo } from 'react';
import { useColorScheme, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { buildLeafletPage, parseLeafletMessage, type MapMarker } from '@/lib/leaflet-html';

export type LeafletMapProps = {
  markers: MapMarker[];
  interactive?: boolean;
  singleMarkerZoom?: number;
  onMarkerPress?: (id: string) => void;
  onMapPress?: () => void;
};

/** OpenStreetMap via Leaflet in a WebView (works in Expo Go; no native map SDK or API key). */
export function LeafletMap({
  markers,
  interactive = true,
  singleMarkerZoom,
  onMarkerPress,
  onMapPress,
}: LeafletMapProps) {
  const mapId = useId();
  const dark = useColorScheme() === 'dark';
  // Rebuild the page only when the pins themselves change, not on every render.
  const markersKey = markers.map((m) => `${m.id}:${m.latitude},${m.longitude}:${m.label ?? ''}`).join('|');
  const html = useMemo(
    () => buildLeafletPage({ mapId, markers, interactive, dark, singleMarkerZoom }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapId, markersKey, interactive, dark, singleMarkerZoom]
  );

  const onMessage = (event: WebViewMessageEvent) => {
    const message = parseLeafletMessage(event.nativeEvent.data, mapId);
    if (message?.type === 'marker') onMarkerPress?.(message.id);
    if (message?.type === 'map') onMapPress?.();
  };

  return (
    // A non-interactive map lets touches fall through to whatever wraps it (e.g. a preview button).
    <View className="flex-1 overflow-hidden" pointerEvents={interactive ? 'auto' : 'none'}>
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        onMessage={onMessage}
        // OSM's tile policy asks apps to identify themselves.
        applicationNameForUserAgent="MyBasera"
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        // The page background matches while tiles load, instead of a white flash.
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />
    </View>
  );
}
