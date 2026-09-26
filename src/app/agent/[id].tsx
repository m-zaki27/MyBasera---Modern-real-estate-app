import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AgentContactButtons } from '@/components/agent-card';
import { BackButton } from '@/components/back-button';
import { PrimaryButton } from '@/components/primary-button';
import { PropertyCardLink } from '@/components/property-card-link';
import { ScreenMessage } from '@/components/screen-message';
import { colors } from '@/constants/colors';
import { useAgent } from '@/hooks/use-agent';

export default function AgentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { agent, loading, error, retry } = useAgent(id);
  const insets = useSafeAreaInsets();

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
          Couldn&apos;t load this agent.
        </Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <View className="w-full">
          <PrimaryButton title="Try again" onPress={retry} />
        </View>
      </ScreenMessage>
    );
  }

  if (!agent) {
    return (
      <ScreenMessage>
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          This agent isn&apos;t available anymore.
        </Text>
      </ScreenMessage>
    );
  }

  const listingCount = agent.properties.length;

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <BackButton />
      <FlatList
        data={agent.properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCardLink property={item} />}
        // Clear the status bar and floating back button; insets are runtime values.
        contentContainerStyle={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 32 }}
        contentContainerClassName="gap-4"
        ListHeaderComponent={
          <View className="items-center gap-3 px-screen pb-4">
            <Image
              source={agent.avatar ? { uri: agent.avatar } : undefined}
              className="h-24 w-24 rounded-full bg-surface dark:bg-surface-dark"
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                {agent.name}
              </Text>
              <Text className="text-sm text-muted dark:text-muted-dark">
                Real estate agent · {listingCount} {listingCount === 1 ? 'listing' : 'listings'}
              </Text>
            </View>
            {agent.email || agent.phone ? (
              <View className="items-center gap-1">
                {agent.phone ? (
                  <Text className="text-sm text-foreground dark:text-foreground-dark">
                    {agent.phone}
                  </Text>
                ) : null}
                {agent.email ? (
                  <Text className="text-sm text-foreground dark:text-foreground-dark">
                    {agent.email}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <AgentContactButtons agent={agent} />
            <Text className="mt-4 self-start text-lg font-bold text-foreground dark:text-foreground-dark">
              Listings
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text className="px-screen text-sm text-muted dark:text-muted-dark">
            No active listings.
          </Text>
        }
      />
    </View>
  );
}
