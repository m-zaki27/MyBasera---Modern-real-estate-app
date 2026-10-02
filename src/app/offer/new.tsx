import { useUser } from '@clerk/expo';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Chip } from '@/components/filter-chips';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { useProperty } from '@/hooks/use-property';
import { getOrCreateConversation } from '@/lib/chat-api';
import { startOffer } from '@/lib/deals-api';
import { formatPrice } from '@/lib/format';

// 11 months is the usual residential lease in Pakistan (it avoids long-lease registration).
const LEASE_OPTIONS = [6, 11, 12, 24] as const;

/** DD/MM/YYYY (how dates are written in Pakistan) → YYYY-MM-DD, or null if invalid/empty. */
function parseDate(text: string): string | null | 'invalid' {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(trimmed);
  if (!match) return 'invalid';
  const [, day, month, year] = match;
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) || date.getDate() !== Number(day) ? 'invalid' : iso;
}

export default function NewOfferScreen() {
  const { propertyId, conversationId } = useLocalSearchParams<{
    propertyId: string;
    conversationId?: string;
  }>();
  const { user } = useUser();
  const { property, loading } = useProperty(propertyId);

  const [amount, setAmount] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [moveIn, setMoveIn] = useState('');
  const [leaseMonths, setLeaseMonths] = useState<number>(11);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !property || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        {loading ? (
          <ActivityIndicator color={colors.primary.DEFAULT} />
        ) : (
          <Text className="text-base text-foreground dark:text-foreground-dark">This listing isn’t available.</Text>
        )}
      </View>
    );
  }

  const isRent = property.listing_type === 'rent';
  const isAgent = property.agent?.clerk_user_id === user.id;
  const amountText = amount ?? String(property.price);
  const title = isRent ? (isAgent ? 'Send rental terms' : 'Apply to rent') : isAgent ? 'Send an offer' : 'Make an offer';

  const onSubmit = async () => {
    const value = Number(amountText.replace(/[,\s]/g, ''));
    if (!Number.isFinite(value) || value <= 0) {
      setError(isRent ? 'Enter the monthly rent you’re offering.' : 'Enter the price you’re offering.');
      return;
    }
    const moveInDate = isRent ? parseDate(moveIn) : null;
    if (moveInDate === 'invalid') {
      setError('Enter the move-in date as DD/MM/YYYY, or leave it empty.');
      return;
    }
    if (!property.agent?.clerk_user_id) {
      setError('This agent isn’t on MyBasera yet — call or email them instead.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const email = user.primaryEmailAddress?.emailAddress;
      const threadId =
        conversationId ??
        (await getOrCreateConversation({
          propertyId: property.id,
          agentId: property.agent.id,
          buyerId: user.id,
          buyerName: user.fullName || email?.split('@')[0] || 'MyBasera user',
          buyerAvatar: user.hasImage ? user.imageUrl : null,
        }));
      const deal = await startOffer({
        conversationId: threadId,
        amount: value,
        note,
        moveInDate,
        leaseMonths: isRent ? leaseMonths : null,
      });
      router.replace({ pathname: '/deal/[id]', params: { id: deal.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen options={{ title }} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-6 px-screen py-6" keyboardShouldPersistTaps="handled">
          <View className="gap-1 rounded-card bg-surface p-4 dark:bg-surface-dark">
            <Text className="text-base font-bold text-foreground dark:text-foreground-dark">{property.name}</Text>
            <Text className="text-sm text-muted dark:text-muted-dark">{property.address}</Text>
            <Text className="text-sm text-primary">
              Asking {formatPrice(property.price, property.listing_type)}
            </Text>
          </View>

          <View className="gap-1">
            <FormField
              label={isRent ? 'Monthly rent you’re offering (PKR)' : 'Your offer (PKR)'}
              value={amountText}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />
            {Number(amountText.replace(/[,\s]/g, '')) > 0 ? (
              <Text className="text-xs text-muted dark:text-muted-dark">
                = {formatPrice(Number(amountText.replace(/[,\s]/g, '')), property.listing_type)}
              </Text>
            ) : null}
          </View>

          {isRent ? (
            <>
              <FormField
                label="Move-in date (optional)"
                value={moveIn}
                onChangeText={setMoveIn}
                placeholder="DD/MM/YYYY"
                keyboardType="numbers-and-punctuation"
              />
              <View className="gap-2">
                <Text className="text-sm font-medium text-foreground dark:text-foreground-dark">Lease length</Text>
                <View className="flex-row flex-wrap gap-2">
                  {LEASE_OPTIONS.map((months) => (
                    <Chip
                      key={months}
                      label={`${months} months`}
                      selected={leaseMonths === months}
                      onPress={() => setLeaseMonths(months)}
                    />
                  ))}
                </View>
              </View>
            </>
          ) : null}

          <FormField
            label="Message (optional)"
            value={note}
            onChangeText={setNote}
            placeholder={isRent ? 'A bit about you, family size, job…' : 'Payment plan, timeline, conditions…'}
            multiline
            maxLength={500}
          />

          {error ? <Text className="text-sm text-danger-text dark:text-danger-text-dark">{error}</Text> : null}

          <PrimaryButton title={isRent ? 'Send application' : 'Send offer'} onPress={onSubmit} loading={submitting} />
          <Text className="text-xs leading-5 text-muted dark:text-muted-dark">
            {isAgent
              ? 'The buyer can accept, counter or decline.'
              : 'The agent can accept, counter or decline. Nothing is binding until both of you confirm the deal is completed.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
