import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { PropertyDetail } from '@/hooks/use-property';
import { formatDate } from '@/lib/format';

type ReviewItemProps = {
  review: PropertyDetail['reviews'][number];
};

const STARS = [1, 2, 3, 4, 5] as const;

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <View className="gap-2 rounded-card bg-surface p-4 dark:bg-surface-dark">
      <View className="flex-row items-center justify-between">
        <View
          className="flex-row gap-0.5"
          accessible
          accessibilityLabel={`${review.rating} out of 5 stars`}>
          {STARS.map((star) => (
            <SymbolView
              key={star}
              name={{ ios: 'star.fill', android: 'star', web: 'star' }}
              tintColor={star <= review.rating ? colors.rating.DEFAULT : colors.border.DEFAULT}
              size={14}
            />
          ))}
        </View>
        <Text className="text-xs text-muted dark:text-muted-dark">{formatDate(review.created_at)}</Text>
      </View>
      {review.comment ? (
        <Text className="text-sm leading-5 text-foreground dark:text-foreground-dark">
          {review.comment}
        </Text>
      ) : null}
    </View>
  );
}
