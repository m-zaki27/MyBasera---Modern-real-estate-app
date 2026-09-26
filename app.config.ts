import type { ConfigContext, ExpoConfig } from 'expo/config';

// Static config lives in app.json; this file only adds values that must not be committed.
//
// GOOGLE_MAPS_ANDROID_API_KEY comes from .env.local for local builds and from the
// EAS environment variable of the same name for cloud builds (.env.local is not
// uploaded to EAS). It's baked into the Android binary, so restrict the key to this
// app's package name + SHA-1 in Google Cloud. Changing it requires a rebuild.
export default ({ config }: ConfigContext): ExpoConfig => {
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      ['react-native-maps', androidGoogleMapsApiKey ? { androidGoogleMapsApiKey } : {}],
    ],
  };
};
