import { Pressable, ScrollView, Text } from 'react-native';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? 'rounded-full border border-primary bg-primary px-4 py-2'
          : 'rounded-full border border-border bg-background px-4 py-2 dark:border-border-dark dark:bg-background-dark'
      }>
      <Text
        className={
          selected
            ? 'text-sm font-semibold text-white'
            : 'text-sm font-medium text-foreground dark:text-foreground-dark'
        }>
        {label}
      </Text>
    </Pressable>
  );
}

type FilterChipsProps<T extends string | number> = {
  options: readonly T[];
  selected: T;
  onSelect: (option: T) => void;
  getLabel?: (option: T) => string;
};

/** Single-select chips in a horizontal scroller. */
export function FilterChips<T extends string | number>({
  options,
  selected,
  onSelect,
  getLabel = String,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-screen">
      {options.map((option) => (
        <Chip
          key={option}
          label={getLabel(option)}
          selected={option === selected}
          onPress={() => onSelect(option)}
        />
      ))}
    </ScrollView>
  );
}
