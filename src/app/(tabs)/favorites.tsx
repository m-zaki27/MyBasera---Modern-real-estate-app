import { Text, View } from 'react-native';

export default function FavoritesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
      <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">Favorites</Text>
    </View>
  );
}
