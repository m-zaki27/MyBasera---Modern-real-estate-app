import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AgentCard } from '@/components/agent-card';
import { BackButton } from '@/components/back-button';
import { FavoriteButton } from '@/components/favorite-button';
import { GradientView } from '@/components/gradient-view';
import { ListingDealActions } from '@/components/listing-deal-actions';
import { LocationPreview } from '@/components/location-preview';
import { OwnerListingPanel } from '@/components/owner-listing-panel';
import { PrimaryButton } from '@/components/primary-button';
import { PropertySpecs } from '@/components/property-specs';
import { ReviewItem } from '@/components/review-item';
import { ScreenMessage } from '@/components/screen-message';
import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/colors';
import { useProperty } from '@/hooks/use-property';
import { formatPrice } from '@/lib/format';

const HERO_HEIGHT = 340;

type SectionProps = {
  title: string;
  delay: number;
  children: ReactNode;
};

/** A titled section that fades up into place. */
function Section({ title, delay, children }: SectionProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <View className="gap-3">
        <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">{title}</Text>
        {children}
      </View>
    </Animated.View>
  );
}

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { property, loading, error, retry } = useProperty(id);
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();

  // Parallax hero: the photo zooms when pulled down and drifts up slower than the content.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-HERO_HEIGHT, 0, HERO_HEIGHT],
          [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.5]
        ),
      },
      { scale: interpolate(scrollY.value, [-HERO_HEIGHT, 0], [2, 1], Extrapolation.CLAMP) },
    ],
  }));

  if (loading) {
    return (
      <ScreenMessage>
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </ScreenMessage>
    );
  }

  if (error) {
    return (
      <ScreenMessage>
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          Couldn&apos;t load this property.
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <View className="w-full">
          <PrimaryButton title="Try again" onPress={retry} />
        </View>
      </ScreenMessage>
    );
  }

  if (!property) {
    return (
      <ScreenMessage>
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          This property isn&apos;t available anymore.
        </Text>
      </ScreenMessage>
    );
  }

  const reviewCount = property.reviews.length;
  const isOwnListing = Boolean(userId) && property.agent?.clerk_user_id === userId;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar style="light" />
      <BackButton />
      <View
        // Same runtime status-bar offset as the back button.
        style={{ top: insets.top + 8 }}
        className="absolute right-4 z-10">
        <FavoriteButton propertyId={property.id} propertyName={property.name} size="md" />
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        // Keep the last section clear of the home indicator.
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Animated.View style={[{ height: HERO_HEIGHT }, heroStyle]}>
          <Image
            source={property.image_url ? { uri: property.image_url } : undefined}
            className="h-full w-full bg-surface dark:bg-surface-dark"
            contentFit="cover"
            transition={250}
            accessibilityIgnoresInvertColors
          />
          {/* Darken the top so the back/favorite buttons and status bar stay visible. */}
          <GradientView
            colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
            className="absolute inset-0"
          />
        </Animated.View>

        {/* Content sheet overlapping the photo. */}
        <View className="-mt-8 gap-7 rounded-t-[32px] bg-background px-screen pt-6 dark:bg-background-dark">
          <Animated.View entering={FadeInDown.duration(400)}>
            <View className="gap-2.5">
              <View className="flex-row flex-wrap items-center gap-2">
                <View className="rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-900">
                  <Text className="text-xs font-semibold text-primary dark:text-primary-200">{property.type}</Text>
                </View>
                <View className="rounded-full bg-teal-50 px-3 py-1 dark:bg-teal-900">
                  <Text className="text-xs font-semibold text-teal dark:text-teal-100">
                    {property.listing_type === 'rent' ? 'For rent' : 'For sale'}
                  </Text>
                </View>
                <StatusBadge status={property.status} />
                <View
                  className="flex-row items-center gap-1"
                  accessible
                  accessibilityLabel={
                    property.rating > 0 ? `Rated ${property.rating.toFixed(1)} out of 5` : 'New listing'
                  }>
                  <SymbolView
                    name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                    tintColor={colors.rating.DEFAULT}
                    size={14}
                  />
                  <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                    {property.rating > 0 ? property.rating.toFixed(1) : 'New'}
                  </Text>
                  <Text className="text-sm text-muted dark:text-muted-dark">
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </Text>
                </View>
              </View>
              <Text className="text-[26px] font-extrabold leading-8 tracking-tight text-foreground dark:text-foreground-dark">
                {property.name}
              </Text>
              <Pressable
                onPress={() => router.push({ pathname: '/map/[id]', params: { id: property.id } })}
                accessibilityRole="link"
                accessibilityHint="Opens the full-screen map"
                className="flex-row items-center gap-1.5 self-start active:opacity-70">
                <SymbolView
                  name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
                  tintColor={colors.primary.DEFAULT}
                  size={16}
                />
                <Text className="text-sm text-muted underline dark:text-muted-dark">{property.address}</Text>
              </Pressable>
              <View className="mt-1 gap-3 rounded-card bg-surface p-4 dark:bg-surface-dark">
                <View>
                  <Text className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                    {property.listing_type === 'rent' ? 'Monthly rent' : 'Asking price'}
                  </Text>
                  <Text className="text-2xl font-extrabold text-primary dark:text-primary-300">
                    {formatPrice(property.price, property.listing_type)}
                  </Text>
                </View>
                <PropertySpecs bedrooms={property.bedrooms} bathrooms={property.bathrooms} area={property.area} />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            {isOwnListing ? (
              <OwnerListingPanel
                propertyId={property.id}
                propertyName={property.name}
                listingType={property.listing_type}
                status={property.status}
                onChanged={retry}
              />
            ) : (
              <ListingDealActions
                propertyId={property.id}
                listingType={property.listing_type}
                status={property.status}
                agent={property.agent}
              />
            )}
          </Animated.View>

          {property.facilities.length > 0 ? (
            <Section title="Facilities" delay={140}>
              <View className="flex-row flex-wrap gap-2">
                {property.facilities.map((facility) => (
                  <View
                    key={facility}
                    className="rounded-full border border-border bg-surface px-3.5 py-1.5 dark:border-border-dark dark:bg-surface-dark">
                    <Text className="text-sm text-foreground dark:text-foreground-dark">{facility}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <LocationPreview
              propertyId={property.id}
              address={property.address}
              latitude={property.latitude}
              longitude={property.longitude}
            />
          </Animated.View>

          {property.agent ? (
            <Section title="Listed by" delay={260}>
              <AgentCard agent={property.agent} />
            </Section>
          ) : null}

          <Section title={`Reviews${reviewCount > 0 ? ` (${reviewCount})` : ''}`} delay={320}>
            {reviewCount > 0 ? (
              property.reviews.map((review) => <ReviewItem key={review.id} review={review} />)
            ) : (
              <Text className="text-sm text-muted dark:text-muted-dark">
                No reviews yet — reviews appear after a completed deal.
              </Text>
            )}
          </Section>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
