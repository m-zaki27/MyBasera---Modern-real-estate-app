import { useEffect, useId, useMemo } from 'react';
import { useColorScheme, View } from 'react-native';

import type { LeafletMapProps } from '@/components/leaflet-map';
import { buildLeafletPage, parseLeafletMessage } from '@/lib/leaflet-html';

/** Web version of LeafletMap: the same page in a sandboxed iframe (WebView has no web support). */
export function LeafletMap({
  markers,
  interactive = true,
  singleMarkerZoom,
  onMarkerPress,
  onMapPress,
}: LeafletMapProps) {
  const mapId = useId();
  const dark = useColorScheme() === 'dark';
  const markersKey = markers.map((m) => `${m.id}:${m.latitude},${m.longitude}:${m.label ?? ''}`).join('|');
  const html = useMemo(
    () => buildLeafletPage({ mapId, markers, interactive, dark, singleMarkerZoom }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapId, markersKey, interactive, dark, singleMarkerZoom]
  );

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      const message = parseLeafletMessage(event.data, mapId);
      if (message?.type === 'marker') onMarkerPress?.(message.id);
      if (message?.type === 'map') onMapPress?.();
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [mapId, onMarkerPress, onMapPress]);

  return (
    <View className="flex-1 overflow-hidden" pointerEvents={interactive ? 'auto' : 'none'}>
      <iframe
        title="Map"
        srcDoc={html}
        sandbox="allow-scripts"
        // Absolute fill: percentage heights inside flex layouts can resolve to 0.
        style={{ border: 0, position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </View>
  );
}
