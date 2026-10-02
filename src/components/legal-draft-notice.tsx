import { Text, View } from 'react-native';

/** Shown on legal pages until real, lawyer-reviewed text replaces the starter template. */
export function LegalDraftNotice() {
  return (
    <View className="rounded-field bg-danger-soft px-4 py-3 dark:bg-danger-soft-dark">
      <Text className="text-xs text-danger-text dark:text-danger-text-dark">
        Draft template — this text must be reviewed by a qualified lawyer and updated with
        MyBasera’s legal details before public release.
      </Text>
    </View>
  );
}
