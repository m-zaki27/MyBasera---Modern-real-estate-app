import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import type { ConversationWithContext } from '@/hooks/use-conversations';
import { describeStatus, isMyTurn, isOpenDeal } from '@/lib/deal-flow';
import { formatPrice } from '@/lib/format';
import type { Deal, DealSide } from '@/types/database';

type DealBannerProps = {
  conversation: ConversationWithContext;
  /** Newest first. */
  deals: Deal[];
  mySide: DealSide;
};

/** Chat header strip: the open deal (tap for details), or a way to start one. */
export function DealBanner({ conversation, deals, mySide }: DealBannerProps) {
  const property = conversation.property;
  if (!property) return null;

  const openDeal = deals.find(isOpenDeal);
  const shown = openDeal ?? deals[0];

  if (shown && (openDeal || shown.status === 'completed')) {
    const myTurn = isMyTurn(shown, mySide);
    return (
      <Pressable
        onPress={() => router.push({ pathname: '/deal/[id]', params: { id: shown.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Deal: ${describeStatus(shown, mySide)}. Open deal`}
        className={`mx-screen mb-3 flex-row items-center gap-3 rounded-card p-3 active:opacity-80 ${
          myTurn ? 'border border-primary bg-primary-50 dark:bg-primary-900' : 'bg-surface dark:bg-surface-dark'
        }`}>
        <SymbolView
          name={{ ios: 'checkmark.seal.fill', android: 'handshake', web: 'handshake' }}
          tintColor={colors.primary.DEFAULT}
          size={22}
        />
        <View className="flex-1">
          <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">
            {formatPrice(shown.amount, shown.deal_type)}
          </Text>
          <Text className={`text-xs ${myTurn ? 'font-semibold text-primary' : 'text-muted dark:text-muted-dark'}`}>
            {describeStatus(shown, mySide)}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-primary">View deal</Text>
      </Pressable>
    );
  }

  if (property.status !== 'active') return null;

  const isRent = property.listing_type === 'rent';
  const label = mySide === 'agent' ? (isRent ? 'Send rental terms' : 'Send an offer') : isRent ? 'Apply to rent' : 'Make an offer';

  return (
    <View className="px-screen pb-3">
      <PrimaryButton
        title={label}
        variant="outline"
        onPress={() =>
          router.push({
            pathname: '/offer/new',
            params: { propertyId: property.id, conversationId: conversation.id },
          })
        }
      />
    </View>
  );
}
