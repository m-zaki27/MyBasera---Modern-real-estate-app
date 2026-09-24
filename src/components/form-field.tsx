import { Text, TextInput, View, type TextInputProps } from 'react-native';

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</Text>
      <TextInput
        className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        placeholderTextColor="#a3a3a3"
        {...inputProps}
      />
    </View>
  );
}
