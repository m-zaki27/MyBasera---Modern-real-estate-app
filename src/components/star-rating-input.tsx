import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { colors } from '@/constants/colors';

type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
};

const STARS = [1, 2, 3, 4, 5] as const;

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <View className="flex-row gap-2" accessibilityLabel={`Rating: ${value} of 5`}>
      {STARS.map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          accessibilityRole="button"
          accessibilityLabel={`${star} star${star === 1 ? '' : 's'}`}
          accessibilityState={{ selected: star <= value }}
          hitSlop={4}>
          <SymbolView
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            tintColor={star <= value ? colors.rating.DEFAULT : colors.border.DEFAULT}
            size={36}
          />
        </Pressable>
      ))}
    </View>
  );
}
