import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AgentCard } from '@/components/agent-card';
import { PrimaryButton } from '@/components/primary-button';
import { PropertySpecs } from '@/components/property-specs';
import { ReviewItem } from '@/components/review-item';
import { colors } from '@/constants/colors';
import { useProperty } from '@/hooks/use-property';
import { formatPrice } from '@/lib/format';
import { getMapsUrl } from '@/lib/maps';

function BackButton() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      // Offset below the status bar; the inset is a runtime value NativeWind can't express.
      style={{ top: insets.top + 8 }}
      className="absolute left-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-background/90 dark:bg-background-dark/90">
      <SymbolView
        name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
        tintColor={isDark ? colors.foreground.dark : colors.foreground.DEFAULT}
        size={20}
      />
    </Pressable>
  );
}

type CenteredMessageProps = {
  children: ReactNode;
};

function CenteredMessage({ children }: CenteredMessageProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-screen dark:bg-background-dark">
      <BackButton />
      {children}
    </View>
  );
}

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { property, loading, error, retry } = useProperty(id);
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <CenteredMessage>
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </CenteredMessage>
    );
  }

  if (error) {
    return (
      <CenteredMessage>
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          Couldn&apos;t load this property.
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <View className="w-full">
          <PrimaryButton title="Try again" onPress={retry} />
        </View>
      </CenteredMessage>
    );
  }

  if (!property) {
    return (
      <CenteredMessage>
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          This property isn&apos;t available anymore.
        </Text>
      </CenteredMessage>
    );
  }

  const reviewCount = property.reviews.length;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar style="light" />
      <BackButton />
      <ScrollView
        // Keep the last section clear of the home indicator.
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Image
          source={property.image_url ? { uri: property.image_url } : undefined}
          className="aspect-[4/3] w-full bg-surface dark:bg-surface-dark"
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />

        <View className="gap-6 px-screen pt-5">
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-900">
                <Text className="text-xs font-semibold text-primary dark:text-primary-200">
                  {property.type}
                </Text>
              </View>
              <View
                className="flex-row items-center gap-1"
                accessible
                accessibilityLabel={`Rated ${property.rating.toFixed(1)} out of 5`}>
                <SymbolView
                  name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                  tintColor={colors.rating.DEFAULT}
                  size={14}
                />
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                  {property.rating.toFixed(1)}
                </Text>
                <Text className="text-sm text-muted dark:text-muted-dark">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </Text>
              </View>
            </View>
            <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
              {property.name}
            </Text>
            <Text className="text-2xl font-bold text-primary">{formatPrice(property.price)}</Text>
            <Pressable
              onPress={() => Linking.openURL(getMapsUrl({ label: property.name, ...property }))}
              accessibilityRole="link"
              accessibilityHint="Opens the address in your maps app"
              className="flex-row items-center gap-1.5 self-start">
              <SymbolView
                name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
                tintColor={colors.primary.DEFAULT}
                size={16}
              />
              <Text className="text-sm text-muted underline dark:text-muted-dark">
                {property.address}
              </Text>
            </Pressable>
          </View>

          <PropertySpecs
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            area={property.area}
          />

          {property.facilities.length > 0 ? (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
                Facilities
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {property.facilities.map((facility) => (
                  <View
                    key={facility}
                    className="rounded-full border border-border px-3 py-1.5 dark:border-border-dark">
                    <Text className="text-sm text-foreground dark:text-foreground-dark">
                      {facility}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {property.agent ? (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
                Agent
              </Text>
              <AgentCard agent={property.agent} />
            </View>
          ) : null}

          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
              Reviews
            </Text>
            {reviewCount > 0 ? (
              property.reviews.map((review) => <ReviewItem key={review.id} review={review} />)
            ) : (
              <Text className="text-sm text-muted dark:text-muted-dark">No reviews yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
