import { Pressable, ScrollView, Text } from 'react-native';

type FilterChipsProps<T extends string> = {
  options: readonly T[];
  selected: T;
  onSelect: (option: T) => void;
};

export function FilterChips<T extends string>({ options, selected, onSelect }: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-screen">
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={
              isSelected
                ? 'rounded-full bg-primary px-4 py-2'
                : 'rounded-full border border-border bg-background px-4 py-2 dark:border-border-dark dark:bg-background-dark'
            }>
            <Text
              className={
                isSelected
                  ? 'text-sm font-semibold text-white'
                  : 'text-sm font-medium text-foreground dark:text-foreground-dark'
              }>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
