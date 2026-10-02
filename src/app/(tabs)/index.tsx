import { useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactElement } from 'react';
import { Platform, Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { FilterChips } from '@/components/filter-chips';
import { GradientView } from '@/components/gradient-view';
import { PrimaryButton } from '@/components/primary-button';
import { PropertyCardLink } from '@/components/property-card-link';
import { SearchBar } from '@/components/search-bar';
import { PropertyCardSkeleton } from '@/components/skeleton';
import { HERO_SUBTITLE } from '@/constants/brand';
import { colors } from '@/constants/colors';
import { PROPERTY_TYPE_FILTERS } from '@/constants/property';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useProperties, type PropertyListItem } from '@/hooks/use-properties';
import { useFiltersStore } from '@/store/filters';

// The logo's sunset: coral sky fading into the deep teal hills.
const HERO_GRADIENT = [colors.sunset.DEFAULT, '#B5523F', colors.teal[500], colors.teal.DEFAULT] as const;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Distinct cities, taken from the last part of each address ("…, DHA, Lahore" → Lahore). */
function countCities(properties: PropertyListItem[]): number {
  return new Set(properties.map((p) => p.address.split(',').pop()?.trim().toLowerCase()).filter(Boolean)).size;
}

type HeroStatProps = {
  value: string;
  label: string;
};

function HeroStat({ value, label }: HeroStatProps) {
  return (
    <View className="flex-1 rounded-2xl bg-white/15 px-3 py-2.5">
      <Text className="text-lg font-extrabold text-white">{value}</Text>
      <Text className="text-xs text-white/80">{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
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

  // Fade in a compact brand bar once the hero has scrolled away.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const compactBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [140, 220], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [140, 220], [-12, 0], Extrapolation.CLAMP) }],
  }));

  const firstName = user?.firstName ?? user?.primaryEmailAddress?.emailAddress.split('@')[0];
  const hasFilters = query.trim() !== '' || type !== 'All';
  const cityCount = countCities(properties);

  const header = (
    <View className="gap-5 pb-2">
      <GradientView
        colors={HERO_GRADIENT}
        className="overflow-hidden rounded-b-[32px] px-screen pb-6"
        // Extend the gradient behind the status bar.
        style={{ paddingTop: insets.top + 12 }}>
        <Animated.View entering={FadeInDown.duration(450)}>
          <View className="flex-row items-center justify-between">
            <BrandMark size={34} tone="light" />
            {user ? (
              <Pressable
                onPress={() => router.navigate('/profile')}
                accessibilityRole="button"
                accessibilityLabel="Open your profile"
                className="rounded-full border-2 border-white/70 active:opacity-80">
                <Image
                  source={{ uri: user.imageUrl }}
                  className="h-10 w-10 rounded-full"
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
              </Pressable>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(450)}>
          <View className="gap-1 pt-6">
            <Text className="text-sm font-medium text-white/85">
              {greeting()}
              {firstName ? `, ${firstName}` : ''} 👋
            </Text>
            <Text className="text-[32px] font-extrabold leading-10 tracking-tight text-white">
              Find your basera
            </Text>
            <Text className="text-sm text-white/80">{HERO_SUBTITLE}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(450)}>
          <View className="pt-5">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search by area, city or name"
              variant="onBrand"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(450)}>
          <View className="flex-row gap-3 pt-4">
            <HeroStat value={loading ? '—' : String(properties.length)} label="Homes listed" />
            <HeroStat value={loading ? '—' : String(cityCount)} label={cityCount === 1 ? 'City' : 'Cities'} />
            <HeroStat value="PKR" label="Local prices" />
          </View>
        </Animated.View>
      </GradientView>

      <View className="gap-3">
        <Text className="px-screen text-lg font-bold text-foreground dark:text-foreground-dark">
          Browse by type
        </Text>
        <FilterChips options={PROPERTY_TYPE_FILTERS} selected={type} onSelect={setType} />
      </View>

      <View className="flex-row items-baseline justify-between px-screen pt-1">
        <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
          {hasFilters ? 'Matching homes' : 'Featured homes'}
        </Text>
        {!loading && !error ? (
          <Text className="text-sm text-muted dark:text-muted-dark">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </Text>
        ) : null}
      </View>
    </View>
  );

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
      <View className="gap-4 px-screen py-12">
        <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
          Couldn&apos;t load properties
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <PrimaryButton title="Try again" onPress={refresh} />
      </View>
    );
  } else {
    emptyState = (
      <View className="items-center gap-3 px-screen py-12">
        <Text className="text-4xl">🏡</Text>
        <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
          No homes match your search
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">
          Try another area or property type.
        </Text>
        {hasFilters ? (
          <View className="w-full pt-2">
            <PrimaryButton title="Clear filters" onPress={resetFilters} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar style="light" />
      <Animated.FlatList
        data={error ? [] : properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <PropertyCardLink property={item} index={index} />}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyState}
        contentContainerClassName="gap-5 pb-10"
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        // Smooth scrolling: render a few cards up front, recycle off-screen ones on Android.
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.white}
            colors={[colors.primary.DEFAULT]}
            progressViewOffset={insets.top}
          />
        }
      />

      {/* Compact brand bar that appears after scrolling past the hero. */}
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', top: 0, left: 0, right: 0 }, compactBarStyle]}>
        <GradientView
          colors={[colors.teal[500], colors.teal.DEFAULT]}
          angle="90deg"
          className="px-screen pb-3"
          style={{ paddingTop: insets.top + 6 }}>
          <BrandMark size={26} tone="light" />
        </GradientView>
      </Animated.View>
    </View>
  );
}
