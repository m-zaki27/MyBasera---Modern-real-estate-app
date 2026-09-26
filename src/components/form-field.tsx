import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/constants/colors';

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground dark:text-foreground-dark">{label}</Text>
      <TextInput
        className="rounded-field border border-border bg-background px-4 py-3 text-base text-foreground dark:border-border-dark dark:bg-surface-dark dark:text-foreground-dark"
        placeholderTextColor={colors.muted.dark}
        {...inputProps}
      />
    </View>
  );
}
