import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { MyListingRow } from '@/components/my-listing-row';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { useMyListings } from '@/hooks/use-my-listings';

export default function MyListingsScreen() {
  const { listings, loading, error, refresh } = useMyListings();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MyListingRow listing={item} />}
        contentContainerClassName="gap-3 px-screen py-4"
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={colors.primary.DEFAULT} />
            </View>
          ) : error ? (
            <View className="gap-4 py-16">
              <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
              <PrimaryButton title="Try again" onPress={refresh} />
            </View>
          ) : (
            <View className="gap-2 py-16">
              <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
                No listings yet
              </Text>
              <Text className="text-center text-sm text-muted dark:text-muted-dark">
                Post your first property and it will show up here.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <View className="pt-2">
            <PrimaryButton title="List a property" onPress={() => router.push('/listing/new')} />
          </View>
        }
      />
    </View>
  );
}
