import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { FormField } from '@/components/form-field';
import { LeafletMap } from '@/components/leaflet-map';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { locateDevice } from '@/lib/location';

type CoordinatesFieldProps = {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  error?: string;
};

type Notice = { tone: 'info' | 'error'; text: string; offerSettings?: boolean };

/** "31.4730, 74.4590" (as copied from Google Maps) → both parts, or null if not a pair. */
function splitPair(text: string): [string, string] | null {
  const match = /^\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(text);
  return match ? [match[1], match[2]] : null;
}

/** Parses both fields; null unless both are valid coordinates. */
export function parseCoordinates(latitude: string, longitude: string): { latitude: number; longitude: number } | null {
  const lat = Number(latitude.trim());
  const lng = Number(longitude.trim());
  if (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}

/**
 * Map location for a listing: type/paste coordinates, or fill them from the device's GPS
 * (asking for location permission first). Shows a small map preview when valid.
 */
export function CoordinatesField({ latitude, longitude, onChange, error }: CoordinatesFieldProps) {
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const preview = parseCoordinates(latitude, longitude);

  const onLatitudeChange = (text: string) => {
    const pair = splitPair(text);
    if (pair) onChange(pair[0], pair[1]);
    else onChange(text, longitude);
  };

  const onLongitudeChange = (text: string) => {
    const pair = splitPair(text);
    if (pair) onChange(pair[0], pair[1]);
    else onChange(latitude, text);
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    setNotice(null);
    const result = await locateDevice();
    setLocating(false);

    if (result.status === 'located') {
      onChange(String(result.latitude), String(result.longitude));
      setNotice({
        tone: 'info',
        text: 'Filled in from your current location. Make sure you’re at the property — or adjust the numbers.',
      });
      return;
    }
    if (result.status === 'denied') {
      setNotice({
        tone: 'error',
        text: result.canAskAgain
          ? 'Location permission was denied. Enter the coordinates below instead.'
          : 'Location access is turned off for MyBasera. Enter the coordinates below, or allow location in Settings.',
        offerSettings: !result.canAskAgain,
      });
      return;
    }
    setNotice({ tone: 'error', text: `${result.message} You can also enter the coordinates below.` });
  };

  return (
    <View className="gap-3">
      <Text className="text-sm text-muted dark:text-muted-dark">
        Pin the property on the map so buyers can find it. Optional, but listings without a pin
        don’t appear on the map.
      </Text>

      <PrimaryButton
        title={locating ? 'Finding your location…' : 'Use my current location'}
        variant="outline"
        loading={locating}
        onPress={useCurrentLocation}
      />

      {notice ? (
        <View
          className={`gap-2 rounded-field px-4 py-3 ${
            notice.tone === 'error' ? 'bg-danger-soft dark:bg-danger-soft-dark' : 'bg-primary-50 dark:bg-primary-900'
          }`}>
          <Text
            className={`text-sm ${
              notice.tone === 'error'
                ? 'text-danger-text dark:text-danger-text-dark'
                : 'text-foreground dark:text-foreground-dark'
            }`}>
            {notice.text}
          </Text>
          {notice.offerSettings ? (
            <Text
              onPress={() => Linking.openSettings()}
              accessibilityRole="link"
              className="text-sm font-semibold text-primary">
              Open Settings
            </Text>
          ) : null}
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField
            label="Latitude"
            value={latitude}
            onChangeText={onLatitudeChange}
            keyboardType="numbers-and-punctuation"
            placeholder="31.4730"
            autoCorrect={false}
          />
        </View>
        <View className="flex-1">
          <FormField
            label="Longitude"
            value={longitude}
            onChangeText={onLongitudeChange}
            keyboardType="numbers-and-punctuation"
            placeholder="74.4590"
            autoCorrect={false}
          />
        </View>
      </View>
      {error ? <Text className="text-xs text-danger-text dark:text-danger-text-dark">{error}</Text> : null}

      <View className="flex-row items-start gap-2">
        <SymbolView
          name={{ ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' }}
          tintColor={colors.muted.DEFAULT}
          size={14}
        />
        <Text className="flex-1 text-xs leading-5 text-muted dark:text-muted-dark">
          Not at the property? In Google Maps, long-press the spot — the coordinates appear at the
          top. Copy them and paste into either field.
        </Text>
      </View>

      {preview ? (
        <View className="h-40 overflow-hidden rounded-card border border-border dark:border-border-dark">
          <LeafletMap
            markers={[{ id: 'listing', latitude: preview.latitude, longitude: preview.longitude }]}
            interactive={false}
            singleMarkerZoom={15}
          />
        </View>
      ) : null}
    </View>
  );
}
