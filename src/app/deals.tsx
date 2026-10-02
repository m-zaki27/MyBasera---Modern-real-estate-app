import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { useMyDeals, type DealWithContext } from '@/hooks/use-my-deals';
import { describeStatus, isMyTurn, sideOf } from '@/lib/deal-flow';
import { formatDate, formatPrice } from '@/lib/format';

type DealRowProps = {
  deal: DealWithContext;
  myUserId: string;
};

function DealRow({ deal, myUserId }: DealRowProps) {
  const mySide = sideOf(deal, myUserId);
  const myTurn = isMyTurn(deal, mySide);
  const counterpart =
    mySide === 'buyer' ? (deal.agent?.name ?? 'Agent') : (deal.conversation?.buyer_name ?? 'Buyer');

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/deal/[id]', params: { id: deal.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${deal.property?.name ?? 'Listing'}, ${describeStatus(deal, mySide)}, open deal`}
      className={`flex-row items-center gap-3 rounded-card p-3 active:opacity-80 ${
        myTurn ? 'border border-primary bg-primary-50 dark:bg-primary-900' : 'border border-border dark:border-border-dark'
      }`}>
      <Image
        source={deal.property?.image_url ? { uri: deal.property.image_url } : undefined}
        className="h-16 w-20 rounded-field bg-surface dark:bg-surface-dark"
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text
            className="flex-1 text-base font-semibold text-foreground dark:text-foreground-dark"
            numberOfLines={1}>
            {deal.property?.name ?? 'Listing removed'}
          </Text>
          {myTurn ? (
            <View className="rounded-full bg-primary px-2 py-0.5">
              <Text className="text-[11px] font-bold text-white">Your turn</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-sm text-primary">{formatPrice(deal.amount, deal.deal_type)}</Text>
        <Text className="text-xs text-muted dark:text-muted-dark" numberOfLines={1}>
          {describeStatus(deal, mySide)}
        </Text>
        <Text className="text-xs text-muted dark:text-muted-dark">
          {mySide === 'buyer' ? 'With' : deal.deal_type === 'rent' ? 'Tenant:' : 'Buyer:'} {counterpart} ·{' '}
          {formatDate(deal.updated_at)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DealsScreen() {
  const { deals, loading, error, refresh, userId } = useMyDeals();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <FlatList
        data={error || !userId ? [] : deals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DealRow deal={item} myUserId={userId ?? ''} />}
        contentContainerClassName="gap-3 px-screen py-4"
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={colors.primary.DEFAULT} />
            </View>
          ) : error ? (
            <View className="gap-4 py-16">
              <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
              <PrimaryButton title="Try again" onPress={refresh} />
            </View>
          ) : (
            <View className="gap-2 py-16">
              <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
                No deals yet
              </Text>
              <Text className="text-center text-sm text-muted dark:text-muted-dark">
                Make an offer on a listing, or apply to rent one — your deals show up here.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
