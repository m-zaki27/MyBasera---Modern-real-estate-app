import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientView } from '@/components/gradient-view';
import { APP_NAME, HERO_SUBTITLE } from '@/constants/brand';
import { colors } from '@/constants/colors';

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  error?: string | null;
  children: ReactNode;
};

/** Sign-in / sign-up shell: brand hero with the logo, and the form on a rounded sheet. */
export function AuthScreenLayout({ title, subtitle, error, children }: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <StatusBar style="light" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow"
          // Keep the form clear of the home indicator; the inset is a runtime value.
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <GradientView
            colors={[colors.sunset.DEFAULT, '#B5523F', colors.teal[500], colors.teal.DEFAULT]}
            className="items-center px-screen pb-16"
            style={{ paddingTop: insets.top + 32 }}>
            <Animated.View entering={FadeInUp.duration(500)}>
              <View className="items-center gap-3">
                <Image
                  source={require('@/assets/images/logo.png')}
                  className="h-24 w-24"
                  contentFit="contain"
                  accessibilityLabel={`${APP_NAME} logo`}
                />
                <Text className="text-3xl font-extrabold tracking-tight text-white">{APP_NAME}</Text>
                <Text className="text-center text-sm text-white/85">{HERO_SUBTITLE}</Text>
              </View>
            </Animated.View>
          </GradientView>

          <Animated.View entering={FadeInDown.delay(120).duration(450)} style={{ flex: 1 }}>
            <View className="-mt-8 flex-1 gap-6 rounded-t-[32px] bg-background px-screen pt-8 dark:bg-background-dark">
              <View className="gap-1.5">
                <Text className="text-[28px] font-extrabold tracking-tight text-foreground dark:text-foreground-dark">
                  {title}
                </Text>
                {subtitle ? <Text className="text-base text-muted dark:text-muted-dark">{subtitle}</Text> : null}
              </View>
              {error ? (
                <Text className="rounded-field bg-danger-soft px-4 py-3 text-sm text-danger-text dark:bg-danger-soft-dark dark:text-danger-text-dark">
                  {error}
                </Text>
              ) : null}
              {children}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
