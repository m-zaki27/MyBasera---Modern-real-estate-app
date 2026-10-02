import { SymbolView } from 'expo-symbols';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from '@/constants/colors';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** `onBrand`: solid white with a shadow, for use on the brand gradient. */
  variant?: 'default' | 'onBrand';
};

const CONTAINER = {
  default: 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
  onBrand: 'bg-white shadow-lg shadow-black/20',
} as const;

const INPUT = {
  default: 'text-foreground dark:text-foreground-dark',
  onBrand: 'text-foreground',
} as const;

export function SearchBar({ value, onChangeText, placeholder = 'Search', variant = 'default' }: SearchBarProps) {
  return (
    <View className={`flex-row items-center gap-2 rounded-2xl px-4 ${CONTAINER[variant]}`}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        tintColor={colors.muted.DEFAULT}
        size={18}
      />
      <TextInput
        className={`flex-1 py-3.5 text-base ${INPUT[variant]}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={variant === 'onBrand' ? colors.muted.DEFAULT : colors.muted.dark}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel={placeholder}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}>
          <SymbolView
            name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
            tintColor={colors.muted.DEFAULT}
            size={18}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
