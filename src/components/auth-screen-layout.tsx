import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  error?: string | null;
  children: ReactNode;
};

export function AuthScreenLayout({ title, subtitle, error, children }: AuthScreenLayoutProps) {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerClassName="flex-grow justify-center gap-6 px-6 py-10"
            keyboardShouldPersistTaps="handled">
            <View className="gap-2">
              <Text className="text-3xl font-bold text-black dark:text-white">{title}</Text>
              {subtitle ? (
                <Text className="text-base text-neutral-500 dark:text-neutral-400">{subtitle}</Text>
              ) : null}
            </View>
            {error ? (
              <Text className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </Text>
            ) : null}
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
