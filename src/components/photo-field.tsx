import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { showAlert } from '@/lib/alert';
import { base64ByteLength, MAX_PHOTO_BYTES, type PickedPhoto } from '@/lib/storage';

export type PhotoValue =
  | { kind: 'none' }
  | { kind: 'existing'; url: string }
  | { kind: 'picked'; uri: string; photo: PickedPhoto };

type PhotoFieldProps = {
  value: PhotoValue;
  onChange: (value: PhotoValue) => void;
};

export function PhotoField({ value, onChange }: PhotoFieldProps) {
  const previewUri =
    value.kind === 'existing' ? value.url : value.kind === 'picked' ? value.uri : null;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
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
    onChange({
      kind: 'picked',
      uri: asset.uri,
      photo: { base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' },
    });
  };

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground dark:text-foreground-dark">Photo</Text>
      <Pressable
        onPress={pickPhoto}
        accessibilityRole="button"
        accessibilityLabel={previewUri ? 'Change listing photo' : 'Add listing photo'}
        className="aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-card border border-dashed border-border bg-surface active:opacity-80 dark:border-border-dark dark:bg-surface-dark">
        {previewUri ? (
          <>
            <Image
              source={{ uri: previewUri }}
              className="h-full w-full"
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
            <View className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1.5 dark:bg-background-dark/90">
              <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark">
                Change photo
              </Text>
            </View>
          </>
        ) : (
          <View className="items-center gap-2">
            <SymbolView
              name={{ ios: 'photo.badge.plus', android: 'add_photo_alternate', web: 'add_photo_alternate' }}
              tintColor={colors.primary.DEFAULT}
              size={32}
            />
            <Text className="text-sm font-semibold text-primary dark:text-primary-300">Add a photo</Text>
            <Text className="text-xs text-muted dark:text-muted-dark">JPEG or PNG, up to 5 MB</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
