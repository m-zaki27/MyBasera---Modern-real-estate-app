import { useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { colors } from '@/constants/colors';
import { showAlert } from '@/lib/alert';
import { getClerkErrorMessage } from '@/lib/clerk-errors';
import { syncAgentProfile } from '@/lib/profile-sync';
import { base64ByteLength, MAX_PHOTO_BYTES } from '@/lib/storage';

/** The signed-in user's photo with a camera badge; tapping it picks and uploads a new one to Clerk. */
export function ProfileAvatar() {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const changePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.base64) {
      showAlert("Couldn't read that photo", 'Please try a different one.');
      return;
    }
    if (base64ByteLength(asset.base64) > MAX_PHOTO_BYTES) {
      showAlert('Photo too large', 'Please choose a photo under 5 MB.');
      return;
    }

    setUploading(true);
    try {
      // Clerk accepts a base64 data URL in React Native, where Blob/File uploads don't work.
      await user.setProfileImage({
        file: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`,
      });
      await user.reload();
      await syncAgentProfile(user.id, { avatar: user.imageUrl });
    } catch (err) {
      showAlert("Couldn't update your photo", getClerkErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Pressable
      onPress={changePhoto}
      disabled={uploading}
      accessibilityRole="button"
      accessibilityLabel="Change profile photo"
      className="active:opacity-80">
      <Image
        source={{ uri: user.imageUrl }}
        className="h-24 w-24 rounded-full bg-surface dark:bg-surface-dark"
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
      {uploading ? (
        <View className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
          <ActivityIndicator color={colors.white} />
        </View>
      ) : null}
      <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary dark:border-background-dark">
        <SymbolView
          name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
          tintColor={colors.white}
          size={14}
        />
      </View>
    </Pressable>
  );
}
