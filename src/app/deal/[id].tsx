import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { DealStepper } from '@/components/deal-stepper';
import { DealTimeline } from '@/components/deal-timeline';
import { FormField } from '@/components/form-field';
import { PoliceVerificationCard } from '@/components/police-verification-card';
import { PrimaryButton } from '@/components/primary-button';
import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/colors';
import { useDeal } from '@/hooks/use-deal';
import { confirmAction, showAlert } from '@/lib/alert';
import {
  availableActions,
  currentStep,
  describeStatus,
  isMyTurn,
  nextStepsAfterAcceptance,
  sideOf,
} from '@/lib/deal-flow';
import {
  acceptOffer,
  cancelDeal,
  counterOffer,
  declineOffer,
  markDealComplete,
  withdrawOffer,
} from '@/lib/deals-api';
import { formatDate, formatPrice } from '@/lib/format';

type Panel = 'none' | 'counter' | 'decline' | 'cancel';

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-base font-bold text-foreground dark:text-foreground-dark">{title}</Text>
      {children}
    </View>
  );
}

export default function DealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const { deal, events, hasReviewed, loading, error, reload } = useDeal(id);

  const [panel, setPanel] = useState<Panel>('none');
  const [counterAmount, setCounterAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (error || !deal || !userId) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-screen dark:bg-background-dark">
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          {error ?? 'This deal isn’t available.'}
        </Text>
      </View>
    );
  }

  const mySide = sideOf(deal, userId);
  const actions = availableActions(deal, mySide, hasReviewed);
  const step = currentStep(deal, hasReviewed);
  const stopped = ['declined', 'withdrawn', 'cancelled'].includes(deal.status);
  const isRent = deal.deal_type === 'rent';
  const property = deal.property;
  const counterpartName =
    mySide === 'buyer' ? (deal.agent?.name ?? 'the agent') : (deal.conversation?.buyer_name ?? 'the buyer');

  const run = async (action: () => Promise<unknown>, failureTitle: string) => {
    setBusy(true);
    try {
      await action();
      setPanel('none');
      setNote('');
      setCounterAmount('');
      reload();
    } catch (err) {
      showAlert(failureTitle, err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const onAccept = async () => {
    const ok = await confirmAction({
      title: 'Accept this offer?',
      message: `${formatPrice(deal.amount, deal.deal_type)} for ${property?.name ?? 'this listing'}. The listing will be marked "Under offer" and stop taking new offers.`,
      confirmLabel: 'Accept',
    });
    if (ok) await run(() => acceptOffer(deal.id), "Couldn't accept the offer");
  };

  const onCounter = () => {
    const amount = Number(counterAmount.replace(/[,\s]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      showAlert('Enter your counter-offer', 'Use rupees, numbers only.');
      return;
    }
    run(() => counterOffer(deal.id, amount, note), "Couldn't send the counter-offer");
  };

  const onMarkComplete = async () => {
    const ok = await confirmAction({
      title: 'Mark as completed?',
      message: isRent
        ? 'Confirm the agreement is signed, the deposit paid and the keys handed over. The deal completes once both of you confirm.'
        : 'Confirm payment and transfer/possession are done. The deal completes once both of you confirm.',
      confirmLabel: 'Mark completed',
    });
    if (ok) await run(() => markDealComplete(deal.id), "Couldn't update the deal");
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-7 px-screen py-5" keyboardShouldPersistTaps="handled">
          {/* Listing */}
          {property ? (
            <Link href={{ pathname: '/property/[id]', params: { id: property.id } }} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${property.name}, view listing`}
                className="flex-row items-center gap-3 active:opacity-80">
                <Image
                  source={property.image_url ? { uri: property.image_url } : undefined}
                  className="h-16 w-20 rounded-field bg-surface dark:bg-surface-dark"
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-bold text-foreground dark:text-foreground-dark" numberOfLines={1}>
                    {property.name}
                  </Text>
                  <Text className="text-xs text-muted dark:text-muted-dark" numberOfLines={1}>
                    {property.address}
                  </Text>
                  <Text className="text-xs text-muted dark:text-muted-dark">
                    {isRent ? 'Rental' : 'Sale'} with {counterpartName}
                  </Text>
                </View>
                <StatusBadge status={property.status} />
              </Pressable>
            </Link>
          ) : null}

          <DealStepper current={step} stopped={stopped} />

          {/* Current state */}
          <View
            className={`gap-1 rounded-card p-4 ${
              isMyTurn(deal, mySide) ? 'border border-primary bg-primary-50 dark:bg-primary-900' : 'bg-surface dark:bg-surface-dark'
            }`}>
            <Text className="text-xs font-semibold uppercase tracking-wide text-primary dark:text-primary-200">
              {describeStatus(deal, mySide)}
            </Text>
            <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
              {formatPrice(deal.amount, deal.deal_type)}
            </Text>
            <Text className="text-sm text-muted dark:text-muted-dark">
              {deal.status === 'negotiating'
                ? `Latest offer by ${deal.last_offer_by === mySide ? 'you' : counterpartName}`
                : deal.status === 'completed'
                  ? `Completed ${formatDate(deal.completed_at ?? deal.updated_at)}`
                  : deal.status === 'accepted'
                    ? `Agreed ${formatDate(deal.accepted_at ?? deal.updated_at)}`
                    : (deal.close_reason ?? '')}
            </Text>
            {isRent && (deal.lease_months || deal.move_in_date) ? (
              <Text className="text-sm text-muted dark:text-muted-dark">
                {deal.lease_months ? `${deal.lease_months}-month lease` : ''}
                {deal.lease_months && deal.move_in_date ? ' · ' : ''}
                {deal.move_in_date ? `Move-in ${formatDate(deal.move_in_date)}` : ''}
              </Text>
            ) : null}
            {deal.status === 'accepted' ? (
              <Text className="pt-1 text-sm text-foreground dark:text-foreground-dark">
                You: {(mySide === 'agent' ? deal.agent_completed_at : deal.buyer_completed_at) ? '✓ confirmed' : 'not confirmed yet'} ·{' '}
                {counterpartName}: {(mySide === 'agent' ? deal.buyer_completed_at : deal.agent_completed_at) ? '✓ confirmed' : 'not confirmed yet'}
              </Text>
            ) : null}
          </View>

          {/* Actions */}
          {actions.length > 0 ? (
            <View className="gap-3">
              {panel === 'counter' ? (
                <View className="gap-3 rounded-card border border-border p-4 dark:border-border-dark">
                  <FormField
                    label={isRent ? 'Your counter (PKR per month)' : 'Your counter-offer (PKR)'}
                    value={counterAmount}
                    onChangeText={setCounterAmount}
                    keyboardType="number-pad"
                    placeholder={String(deal.amount)}
                  />
                  <FormField label="Message (optional)" value={note} onChangeText={setNote} multiline maxLength={500} />
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <PrimaryButton title="Back" variant="outline" onPress={() => setPanel('none')} />
                    </View>
                    <View className="flex-[2]">
                      <PrimaryButton title="Send counter-offer" loading={busy} onPress={onCounter} />
                    </View>
                  </View>
                </View>
              ) : panel === 'decline' || panel === 'cancel' ? (
                <View className="gap-3 rounded-card border border-border p-4 dark:border-border-dark">
                  <FormField
                    label={panel === 'cancel' ? 'Why are you cancelling? (required)' : 'Reason (optional)'}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    maxLength={500}
                  />
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <PrimaryButton title="Back" variant="outline" onPress={() => setPanel('none')} />
                    </View>
                    <View className="flex-[2]">
                      <PrimaryButton
                        title={panel === 'cancel' ? 'Cancel deal' : 'Decline offer'}
                        loading={busy}
                        disabled={panel === 'cancel' && !note.trim()}
                        onPress={() =>
                          panel === 'cancel'
                            ? run(() => cancelDeal(deal.id, note), "Couldn't cancel the deal")
                            : run(() => declineOffer(deal.id, note), "Couldn't decline the offer")
                        }
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  {actions.includes('accept') ? <PrimaryButton title="Accept offer" loading={busy} onPress={onAccept} /> : null}
                  {actions.includes('mark_complete') ? (
                    <PrimaryButton title="Mark as completed" loading={busy} onPress={onMarkComplete} />
                  ) : null}
                  {actions.includes('review') ? (
                    <PrimaryButton
                      title="Leave a review"
                      onPress={() => router.push({ pathname: '/review/[dealId]', params: { dealId: deal.id } })}
                    />
                  ) : null}
                  <View className="flex-row gap-3">
                    {actions.includes('counter') ? (
                      <View className="flex-1">
                        <PrimaryButton title="Counter" variant="outline" onPress={() => setPanel('counter')} />
                      </View>
                    ) : null}
                    {actions.includes('decline') ? (
                      <View className="flex-1">
                        <PrimaryButton title="Decline" variant="outline" onPress={() => setPanel('decline')} />
                      </View>
                    ) : null}
                    {actions.includes('withdraw') ? (
                      <View className="flex-1">
                        <PrimaryButton
                          title="Withdraw offer"
                          variant="outline"
                          loading={busy}
                          onPress={() => run(() => withdrawOffer(deal.id), "Couldn't withdraw the offer")}
                        />
                      </View>
                    ) : null}
                    {actions.includes('cancel') ? (
                      <View className="flex-1">
                        <PrimaryButton title="Cancel deal" variant="outline" onPress={() => setPanel('cancel')} />
                      </View>
                    ) : null}
                  </View>
                </>
              )}
            </View>
          ) : null}

          {deal.status === 'accepted' ? (
            <Section title="Next steps">
              {nextStepsAfterAcceptance(deal.deal_type).map((item, index) => (
                <View key={item} className="flex-row gap-3">
                  <Text className="w-5 text-sm font-bold text-primary dark:text-primary-300">{index + 1}.</Text>
                  <Text className="flex-1 text-sm leading-5 text-foreground dark:text-foreground-dark">{item}</Text>
                </View>
              ))}
              <Text className="text-xs leading-5 text-muted dark:text-muted-dark">
                MyBasera records what you both agreed. It isn’t a legal sale deed or tenancy agreement —
                complete those through the proper channels.
              </Text>
            </Section>
          ) : null}

          {deal.status === 'completed' && isRent && property ? (
            <PoliceVerificationCard address={property.address} />
          ) : null}
          {deal.status === 'completed' && mySide === 'buyer' && hasReviewed ? (
            <Text className="text-sm text-success">Thanks — your review is posted.</Text>
          ) : null}

          <Section title="History">
            <DealTimeline events={events} mySide={mySide} dealType={deal.deal_type} />
          </Section>

          {deal.conversation ? (
            <PrimaryButton
              title="Open chat"
              variant="outline"
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: deal.conversation_id } })}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
