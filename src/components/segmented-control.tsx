import { Pressable, Text, View } from 'react-native';

type SegmentedControlProps<T extends string> = {
  options: readonly { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-field bg-surface p-1 dark:bg-surface-dark">
      {options.map((option) => {
        const isSelected = option.key === selected;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className={`flex-1 items-center rounded-lg py-2 ${
              isSelected ? 'bg-background shadow-sm dark:bg-border-dark' : ''
            }`}>
            <Text
              className={`text-sm font-semibold ${
                isSelected
                  ? 'text-foreground dark:text-foreground-dark'
                  : 'text-muted dark:text-muted-dark'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
