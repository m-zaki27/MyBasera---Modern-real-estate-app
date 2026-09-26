import { useUser } from '@clerk/expo';
import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChips } from '@/components/filter-chips';
import { PrimaryButton } from '@/components/primary-button';
import { PropertyCard } from '@/components/property-card';
import { SearchBar } from '@/components/search-bar';
import { colors } from '@/constants/colors';
import { PROPERTY_TYPE_FILTERS } from '@/constants/property';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useProperties } from '@/hooks/use-properties';
import { useFiltersStore } from '@/store/filters';

export default function HomeScreen() {
  const { user } = useUser();
  const query = useFiltersStore((state) => state.query);
  const type = useFiltersStore((state) => state.type);
  const setQuery = useFiltersStore((state) => state.setQuery);
  const setType = useFiltersStore((state) => state.setType);
  const resetFilters = useFiltersStore((state) => state.reset);

  const debouncedQuery = useDebouncedValue(query);
  const { properties, loading, refreshing, error, refresh } = useProperties({
    query: debouncedQuery,
    type,
  });

  const greetingName = user?.firstName ?? user?.primaryEmailAddress?.emailAddress.split('@')[0];
  const hasFilters = query.trim() !== '' || type !== 'All';

  const header = (
    <View className="gap-4 pb-4">
      <View className="gap-1 px-screen pt-2">
        <Text className="text-sm text-muted dark:text-muted-dark">
          {greetingName ? `Hi, ${greetingName}` : 'Welcome'}
        </Text>
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
          Find your next home
        </Text>
      </View>
      <View className="px-screen">
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by name or city" />
      </View>
      <FilterChips options={PROPERTY_TYPE_FILTERS} selected={type} onSelect={setType} />
      {!loading && !error ? (
        <Text className="px-screen text-sm text-muted dark:text-muted-dark">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </Text>
      ) : null}
    </View>
  );

  let emptyState: ReactElement;
  if (loading) {
    emptyState = (
      <View className="items-center py-16">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  } else if (error) {
    emptyState = (
      <View className="gap-4 px-screen py-16">
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          Couldn&apos;t load properties.
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <PrimaryButton title="Try again" onPress={refresh} />
      </View>
    );
  } else {
    emptyState = (
      <View className="gap-4 px-screen py-16">
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          No properties match your search.
        </Text>
        {hasFilters ? <PrimaryButton title="Clear filters" onPress={resetFilters} /> : null}
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
          renderItem={({ item }) => (
            <View className="px-screen">
              <PropertyCard property={item} />
            </View>
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={emptyState}
          contentContainerClassName="gap-4 pb-8"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
