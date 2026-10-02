import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

type InfoPageProps = {
  children: ReactNode;
};

/** Scrollable page for static content (About, Help, legal). */
export function InfoPage({ children }: InfoPageProps) {
  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="gap-6 px-screen py-6">{children}</ScrollView>
    </View>
  );
}

type InfoSectionProps = {
  title: string;
  children: ReactNode;
};

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <View className="gap-2">
      <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">{title}</Text>
      {children}
    </View>
  );
}

type InfoTextProps = {
  children: ReactNode;
};

export function InfoText({ children }: InfoTextProps) {
  return <Text className="text-sm leading-6 text-muted dark:text-muted-dark">{children}</Text>;
}
