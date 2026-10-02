import { router } from 'expo-router';
import type { ReactElement } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { PropertyCardLink } from '@/components/property-card-link';
import { ScreenHeader } from '@/components/screen-header';
import { PropertyCardSkeleton } from '@/components/skeleton';
import { colors } from '@/constants/colors';
import { useFavoriteProperties } from '@/hooks/use-favorite-properties';

export default function FavoritesScreen() {
  const { properties, loading, refreshing, error, refresh } = useFavoriteProperties();

  let emptyState: ReactElement;
  if (loading) {
    emptyState = (
      <View className="gap-4">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </View>
    );
  } else if (error) {
    emptyState = (
      <View className="gap-4 px-screen py-16">
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          Couldn&apos;t load your favorites.
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <PrimaryButton title="Try again" onPress={refresh} />
      </View>
    );
  } else {
    emptyState = (
      <View className="gap-4 px-screen py-16">
        <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
          No favorites yet
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">
          Tap the heart on any listing to save it here.
        </Text>
        <PrimaryButton title="Browse properties" onPress={() => router.navigate('/')} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <FlatList
          data={error ? [] : properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <PropertyCardLink property={item} index={index} />}
          ListHeaderComponent={
            <ScreenHeader
              title="Favorites"
              subtitle={
                properties.length > 0
                  ? `${properties.length} saved ${properties.length === 1 ? 'home' : 'homes'}`
                  : 'Homes you save show up here'
              }
            />
          }
          ListEmptyComponent={emptyState}
          contentContainerClassName="gap-4 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}
