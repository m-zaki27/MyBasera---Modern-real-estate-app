import * as Location from 'expo-location';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocateResult =
  | ({ status: 'located' } & Coordinates)
  /** The user said no. `canAskAgain` is false once they've chosen "Don't ask again". */
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; message: string };

/** ~11 cm precision: plenty for a property pin, and keeps the form tidy. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Asks for foreground location permission (only if not already granted), then reads the
 * device's current position.
 */
export async function locateDevice(): Promise<LocateResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    return { status: 'denied', canAskAgain: permission.canAskAgain };
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    return {
      status: 'unavailable',
      message: 'Location services are turned off. Turn on location (GPS) in your phone’s settings and try again.',
    };
  }

  try {
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return {
      status: 'located',
      latitude: roundCoordinate(position.coords.latitude),
      longitude: roundCoordinate(position.coords.longitude),
    };
  } catch (err) {
    return {
      status: 'unavailable',
      message: err instanceof Error ? err.message : 'Couldn’t get your location. Please try again.',
    };
  }
}
