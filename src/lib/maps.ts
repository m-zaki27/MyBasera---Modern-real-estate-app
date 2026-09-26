import { Platform } from 'react-native';

type MapTarget = {
  label: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

/** Deep link that opens the platform's maps app (or Google Maps on web) at a listing. */
export function getMapsUrl({ label, address, latitude, longitude }: MapTarget): string {
  const hasCoords = latitude !== null && longitude !== null;
  const query = encodeURIComponent(hasCoords ? `${latitude},${longitude}` : address);

  if (Platform.OS === 'ios') {
    return hasCoords
      ? `maps:0,0?q=${encodeURIComponent(label)}&ll=${latitude},${longitude}`
      : `maps:0,0?q=${query}`;
  }
  if (Platform.OS === 'android') {
    return hasCoords
      ? `geo:${latitude},${longitude}?q=${query}(${encodeURIComponent(label)})`
      : `geo:0,0?q=${query}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
