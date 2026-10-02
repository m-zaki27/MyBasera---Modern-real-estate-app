type MapTarget = {
  address: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Google Maps link for a listing (Maps URLs API). Opens the Google Maps app when it's
 * installed, otherwise the browser. Uses exact coordinates when the listing has them.
 */
export function getGoogleMapsUrl({ address, latitude, longitude }: MapTarget): string {
  const query = latitude !== null && longitude !== null ? `${latitude},${longitude}` : address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
