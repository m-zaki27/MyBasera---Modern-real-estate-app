import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

type SettingsRowProps = {
  icon: SymbolViewProps['name'];
  label: string;
  onPress: () => void;
  /** Secondary text on the right, e.g. a count. */
  value?: string;
  destructive?: boolean;
};

export function SettingsRow({ icon, label, onPress, value, destructive = false }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-border dark:active:bg-border-dark">
      <SymbolView
        name={icon}
        tintColor={destructive ? colors.danger.DEFAULT : colors.primary.DEFAULT}
        size={20}
      />
      <Text
        className={`flex-1 text-base ${
          destructive ? 'text-danger-text dark:text-danger-text-dark' : 'text-foreground dark:text-foreground-dark'
        }`}>
        {label}
      </Text>
      {value ? <Text className="text-sm text-muted dark:text-muted-dark">{value}</Text> : null}
      {destructive ? null : (
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          tintColor={colors.muted.DEFAULT}
          size={16}
        />
      )}
    </Pressable>
  );
}

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

/** A titled card of SettingsRows with dividers between them. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  // NativeWind can't do `divide-y` (child selectors) on native, so insert dividers explicitly.
  const rows = Children.toArray(children);
  return (
    <View className="gap-2">
      <Text className="px-1 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
        {title}
      </Text>
      <View className="overflow-hidden rounded-card bg-surface dark:bg-surface-dark">
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View className="ml-12 h-px bg-border dark:bg-border-dark" /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
