import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Linking, Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { Agent } from '@/types/database';

type AgentSummary = Pick<Agent, 'id' | 'name' | 'avatar' | 'email' | 'phone'>;

type ContactButtonProps = {
  icon: SymbolViewProps['name'];
  label: string;
  url: string;
};

export function ContactButton({ icon, label, url }: ContactButtonProps) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      className="h-10 w-10 items-center justify-center rounded-full bg-primary-50 active:bg-primary-100 dark:bg-primary-900">
      <SymbolView name={icon} tintColor={colors.primary.DEFAULT} size={18} />
    </Pressable>
  );
}

type AgentContactButtonsProps = {
  agent: AgentSummary;
};

export function AgentContactButtons({ agent }: AgentContactButtonsProps) {
  return (
    <View className="flex-row gap-2">
      {agent.phone ? (
        <ContactButton
          icon={{ ios: 'phone.fill', android: 'call', web: 'call' }}
          label={`Call ${agent.name}`}
          url={`tel:${agent.phone.replace(/[^\d+]/g, '')}`}
        />
      ) : null}
      {agent.email ? (
        <ContactButton
          icon={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
          label={`Email ${agent.name}`}
          url={`mailto:${agent.email}`}
        />
      ) : null}
    </View>
  );
}

type AgentCardProps = {
  agent: AgentSummary;
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-card border border-border p-4 dark:border-border-dark">
      {/* Only the avatar + name link to the agent; the contact buttons stay separate presses. */}
      <Link href={{ pathname: '/agent/[id]', params: { id: agent.id } }} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${agent.name}, view agent profile`}
          className="flex-1 flex-row items-center gap-3 active:opacity-70">
          <Image
            source={agent.avatar ? { uri: agent.avatar } : undefined}
            className="h-12 w-12 rounded-full bg-surface dark:bg-surface-dark"
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
              {agent.name}
            </Text>
            <Text className="text-sm text-primary">View profile</Text>
          </View>
        </Pressable>
      </Link>
      <AgentContactButtons agent={agent} />
    </View>
  );
}
