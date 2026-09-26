import { Image } from 'expo-image';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Linking, Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { PropertyDetail } from '@/hooks/use-property';

type AgentCardProps = {
  agent: NonNullable<PropertyDetail['agent']>;
};

type ContactButtonProps = {
  icon: SymbolViewProps['name'];
  label: string;
  url: string;
};

function ContactButton({ icon, label, url }: ContactButtonProps) {
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

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-card border border-border p-4 dark:border-border-dark">
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
        <Text className="text-sm text-muted dark:text-muted-dark">Listing agent</Text>
      </View>
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
