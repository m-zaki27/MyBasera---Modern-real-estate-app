import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Chip, FilterChips } from '@/components/filter-chips';
import { PrimaryButton } from '@/components/primary-button';
import {
  FACILITIES,
  LISTING_TYPE_OPTIONS,
  MIN_ROOM_OPTIONS,
  RENT_PRICE_RANGES,
  SALE_PRICE_RANGES,
  PROPERTY_TYPE_FILTERS,
  SORT_OPTIONS,
} from '@/constants/property';
import { useProperties } from '@/hooks/use-properties';
import { selectExploreFilters, useExploreFiltersStore } from '@/store/explore-filters';

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View className="gap-3">
      <Text className="px-screen text-base font-bold text-foreground dark:text-foreground-dark">
        {title}
      </Text>
      {children}
    </View>
  );
}

const roomLabel = (count: number) => (count === 0 ? 'Any' : `${count}+`);

export default function ExploreFiltersScreen() {
  const insets = useSafeAreaInsets();
  const filters = useExploreFiltersStore(useShallow(selectExploreFilters));
  const setFilters = useExploreFiltersStore((state) => state.set);
  const toggleFacility = useExploreFiltersStore((state) => state.toggleFacility);
  const reset = useExploreFiltersStore((state) => state.reset);

  // Live result count for the "Show N" button.
  const { properties, loading } = useProperties(filters);
  const resultLabel = loading
    ? 'Show results'
    : `Show ${properties.length} ${properties.length === 1 ? 'result' : 'results'}`;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <Text className="px-screen pb-2 pt-5 text-2xl font-bold text-foreground dark:text-foreground-dark">
        Filters
      </Text>

      <ScrollView contentContainerClassName="gap-7 py-4">
        <Section title="Buy or rent">
          <View className="flex-row flex-wrap gap-2 px-screen">
            {LISTING_TYPE_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={filters.listingType === option.key}
                // Sale and rent use different price bands, so a chosen band can't carry over.
                onPress={() => setFilters({ listingType: option.key, priceRange: 'any' })}
              />
            ))}
          </View>
        </Section>

        <Section title="Property type">
          <FilterChips
            options={PROPERTY_TYPE_FILTERS}
            selected={filters.type}
            onSelect={(type) => setFilters({ type })}
          />
        </Section>

        <Section title={filters.listingType === 'rent' ? 'Monthly rent' : 'Price'}>
          <View className="flex-row flex-wrap gap-2 px-screen">
            {(filters.listingType === 'rent' ? RENT_PRICE_RANGES : SALE_PRICE_RANGES).map((range) => (
              <Chip
                key={range.key}
                label={range.label}
                selected={filters.priceRange === range.key}
                onPress={() => setFilters({ priceRange: range.key })}
              />
            ))}
          </View>
        </Section>

        <Section title="Bedrooms">
          <FilterChips
            options={MIN_ROOM_OPTIONS}
            selected={filters.minBedrooms}
            onSelect={(minBedrooms) => setFilters({ minBedrooms })}
            getLabel={roomLabel}
          />
        </Section>

        <Section title="Bathrooms">
          <FilterChips
            options={MIN_ROOM_OPTIONS}
            selected={filters.minBathrooms}
            onSelect={(minBathrooms) => setFilters({ minBathrooms })}
            getLabel={roomLabel}
          />
        </Section>

        <Section title="Facilities">
          <View className="flex-row flex-wrap gap-2 px-screen">
            {FACILITIES.map((facility) => (
              <Chip
                key={facility}
                label={facility}
                selected={filters.facilities.includes(facility)}
                onPress={() => toggleFacility(facility)}
              />
            ))}
          </View>
        </Section>

        <Section title="Sort by">
          <View className="flex-row flex-wrap gap-2 px-screen">
            {SORT_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={filters.sort === option.key}
                onPress={() => setFilters({ sort: option.key })}
              />
            ))}
          </View>
        </Section>
      </ScrollView>

      <View
        // Keep the actions above the home indicator; the inset is a runtime value.
        style={{ paddingBottom: insets.bottom + 12 }}
        className="flex-row gap-3 border-t border-border px-screen pt-3 dark:border-border-dark">
        <View className="flex-1">
          <PrimaryButton title="Reset" onPress={reset} variant="outline" />
        </View>
        <View className="flex-[2]">
          <PrimaryButton title={resultLabel} onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}
