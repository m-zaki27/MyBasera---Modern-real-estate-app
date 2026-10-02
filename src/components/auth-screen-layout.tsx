import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_NAME } from '@/constants/brand';

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  error?: string | null;
  children: ReactNode;
};

export function AuthScreenLayout({ title, subtitle, error, children }: AuthScreenLayoutProps) {
  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerClassName="flex-grow justify-center gap-6 px-screen py-10"
            keyboardShouldPersistTaps="handled">
            <View className="flex-row items-center gap-3">
              <Image
                source={require('@/assets/images/logo.png')}
                className="h-12 w-12"
                contentFit="contain"
                accessibilityLabel={`${APP_NAME} logo`}
              />
              <Text className="text-xl font-bold text-foreground dark:text-foreground-dark">
                {APP_NAME}
              </Text>
            </View>
            <View className="gap-2">
              <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark">{title}</Text>
              {subtitle ? (
                <Text className="text-base text-muted dark:text-muted-dark">{subtitle}</Text>
              ) : null}
            </View>
            {error ? (
              <Text className="rounded-field bg-danger-soft px-4 py-3 text-sm text-danger-text dark:bg-danger-soft-dark dark:text-danger-text-dark">
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
