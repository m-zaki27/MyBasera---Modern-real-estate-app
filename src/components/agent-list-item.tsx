import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AgentContactButtons } from '@/components/agent-card';
import type { AgentListItem as AgentListItemData } from '@/hooks/use-agents';

type AgentListItemProps = {
  agent: AgentListItemData;
};

export function AgentListItem({ agent }: AgentListItemProps) {
  return (
    <View className="mx-screen flex-row items-center gap-3 rounded-card border border-border p-4 dark:border-border-dark">
      <Link href={{ pathname: '/agent/[id]', params: { id: agent.id } }} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${agent.name}, ${agent.listingCount} listings, view profile`}
          className="flex-1 flex-row items-center gap-3 active:opacity-70">
          <Image
            source={agent.avatar ? { uri: agent.avatar } : undefined}
            className="h-14 w-14 rounded-full bg-surface dark:bg-surface-dark"
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
              {agent.name}
            </Text>
            <Text className="text-sm text-muted dark:text-muted-dark">
              {agent.listingCount} {agent.listingCount === 1 ? 'listing' : 'listings'}
            </Text>
          </View>
        </Pressable>
      </Link>
      <AgentContactButtons agent={agent} />
    </View>
  );
}
