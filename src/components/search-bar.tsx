import { SymbolView } from 'expo-symbols';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from '@/constants/colors';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search' }: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-field border border-border bg-surface px-4 dark:border-border-dark dark:bg-surface-dark">
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        tintColor={colors.muted.DEFAULT}
        size={18}
      />
      <TextInput
        className="flex-1 py-3 text-base text-foreground dark:text-foreground-dark"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted.dark}
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
