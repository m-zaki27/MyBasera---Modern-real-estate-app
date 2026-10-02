import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { StarRatingInput } from '@/components/star-rating-input';
import { colors } from '@/constants/colors';
import { submitReview } from '@/lib/chat-api';
import { supabase } from '@/lib/supabase';

type DealSummary = {
  id: string;
  property_id: string;
  status: string;
  property: { name: string } | null;
};

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'] as const;

export default function ReviewScreen() {
  const { dealId } = useLocalSearchParams<{ dealId: string }>();
  const [deal, setDeal] = useState<DealSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealId) return;
    supabase
      .from('deals')
      .select('id, property_id, status, property:properties(name)')
      .eq('id', dealId)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        setDeal(data);
        setLoading(false);
      });
  }, [dealId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (!deal || deal.status !== 'completed') {
    return (
      <View className="flex-1 items-center justify-center bg-background px-screen dark:bg-background-dark">
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          {error ?? 'You can review a property after your deal is completed.'}
        </Text>
      </View>
    );
  }

  const onSubmit = async () => {
    if (rating === 0) {
      setError('Choose a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview({ dealId: deal.id, propertyId: deal.property_id, rating, comment });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-6 px-screen py-6" keyboardShouldPersistTaps="handled">
          <View className="gap-1">
            <Text className="text-sm text-muted dark:text-muted-dark">Your deal for</Text>
            <Text className="text-xl font-bold text-foreground dark:text-foreground-dark">
              {deal.property?.name ?? 'this property'}
            </Text>
          </View>

          <View className="items-center gap-2">
            <StarRatingInput value={rating} onChange={setRating} />
            <Text className="h-5 text-sm font-semibold text-foreground dark:text-foreground-dark">
              {RATING_LABELS[rating]}
            </Text>
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
              Tell others about it (optional)
            </Text>
            <TextInput
              className="min-h-32 rounded-field border border-border bg-background px-4 py-3 text-base text-foreground dark:border-border-dark dark:bg-surface-dark dark:text-foreground-dark"
              value={comment}
              onChangeText={setComment}
              placeholder="How was the property and the agent?"
              placeholderTextColor={colors.muted.dark}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          {error ? <Text className="text-sm text-danger-text dark:text-danger-text-dark">{error}</Text> : null}
          <PrimaryButton title="Post review" onPress={onSubmit} loading={submitting} />
          <Text className="text-xs text-muted dark:text-muted-dark">
            Reviews are public and show on the listing. Only people who completed a deal can review.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
