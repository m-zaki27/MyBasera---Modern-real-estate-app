import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { AgentListItem } from '@/components/agent-list-item';
import { PrimaryButton } from '@/components/primary-button';
import { PropertyCardLink } from '@/components/property-card-link';
import { PropertyMap } from '@/components/property-map';
import { SegmentedControl } from '@/components/segmented-control';
import { colors } from '@/constants/colors';
import { useAgents } from '@/hooks/use-agents';
import { useProperties } from '@/hooks/use-properties';
import {
  countActiveFilters,
  selectExploreFilters,
  useExploreFiltersStore,
} from '@/store/explore-filters';

type ExploreView = 'list' | 'map' | 'agents';

const VIEW_OPTIONS = [
  { key: 'list', label: 'List' },
  { key: 'map', label: 'Map' },
  { key: 'agents', label: 'Agents' },
] as const;

type StateMessageProps = {
  loading: boolean;
  error: string | null;
  emptyText: string;
  onRetry: () => void;
  emptyAction?: ReactElement | null;
};

function StateMessage({ loading, error, emptyText, onRetry, emptyAction }: StateMessageProps) {
  if (loading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }
  if (error) {
    return (
      <View className="gap-4 px-screen py-16">
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          Something went wrong.
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <PrimaryButton title="Try again" onPress={onRetry} />
      </View>
    );
  }
  return (
    <View className="gap-4 px-screen py-16">
      <Text className="text-center text-base text-foreground dark:text-foreground-dark">
        {emptyText}
      </Text>
      {emptyAction}
    </View>
  );
}

type FiltersButtonProps = {
  activeCount: number;
};

function FiltersButton({ activeCount }: FiltersButtonProps) {
  return (
    <Pressable
      onPress={() => router.push('/explore-filters')}
      accessibilityRole="button"
      accessibilityLabel={activeCount > 0 ? `Filters, ${activeCount} active` : 'Filters'}
      className="flex-row items-center gap-2 rounded-full border border-border px-4 py-2 active:opacity-70 dark:border-border-dark">
      <SymbolView
        name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
        tintColor={colors.primary.DEFAULT}
        size={16}
      />
      <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">Filters</Text>
      {activeCount > 0 ? (
        <View className="h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5">
          <Text className="text-xs font-bold text-white">{activeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function AgentsView() {
  const { agents, loading, refreshing, error, refresh } = useAgents();

  return (
    <FlatList
      data={error ? [] : agents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <AgentListItem agent={item} />}
      contentContainerClassName="gap-3 pb-8 pt-2"
      ListEmptyComponent={
        <StateMessage loading={loading} error={error} emptyText="No agents yet." onRetry={refresh} />
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primary.DEFAULT}
          colors={[colors.primary.DEFAULT]}
        />
      }
    />
  );
}

export default function ExploreScreen() {
  const [view, setView] = useState<ExploreView>('list');

  const filters = useExploreFiltersStore(useShallow(selectExploreFilters));
  const resetFilters = useExploreFiltersStore((state) => state.reset);
  const activeCount = countActiveFilters(filters);

  // Shared by List and Map, so switching views doesn't refetch.
  const { properties, loading, refreshing, error, refresh } = useProperties(filters);

  const resultCount = loading
    ? null
    : `${properties.length} ${properties.length === 1 ? 'result' : 'results'}`;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View className="gap-4 px-screen pb-3 pt-2">
          <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">Explore</Text>
          <SegmentedControl options={VIEW_OPTIONS} selected={view} onSelect={setView} />
          {view !== 'agents' ? (
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted dark:text-muted-dark">{resultCount ?? ' '}</Text>
              <FiltersButton activeCount={activeCount} />
            </View>
          ) : null}
        </View>

        {view === 'agents' ? <AgentsView /> : null}

        {view === 'map' ? <PropertyMap properties={error ? [] : properties} /> : null}

        {view === 'list' ? (
          <FlatList
            data={error ? [] : properties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PropertyCardLink property={item} />}
            contentContainerClassName="gap-4 pb-8 pt-1"
            ListEmptyComponent={
              <StateMessage
                loading={loading}
                error={error}
                emptyText="No properties match these filters."
                onRetry={refresh}
                emptyAction={
                  activeCount > 0 ? (
                    <PrimaryButton title="Reset filters" onPress={resetFilters} />
                  ) : null
                }
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.primary.DEFAULT}
                colors={[colors.primary.DEFAULT]}
              />
            }
          />
        ) : null}
      </SafeAreaView>
    </View>
  );
}
