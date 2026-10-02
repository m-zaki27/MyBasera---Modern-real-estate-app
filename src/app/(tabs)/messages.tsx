import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConversationRow } from '@/components/conversation-row';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/colors';
import { useConversations } from '@/hooks/use-conversations';

export default function MessagesScreen() {
  const { userId } = useAuth();
  const { conversations, loading, error, refresh } = useConversations();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <FlatList
          data={error ? [] : conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConversationRow conversation={item} myUserId={userId ?? ''} />}
          ItemSeparatorComponent={() => <View className="ml-[76px] h-px bg-border dark:bg-border-dark" />}
          ListHeaderComponent={<ScreenHeader title="Messages" subtitle="Chats with agents and buyers" />}
          ListEmptyComponent={
            loading ? (
              <View className="items-center py-16">
                <ActivityIndicator color={colors.primary.DEFAULT} />
              </View>
            ) : error ? (
              <View className="gap-4 px-screen py-16">
                <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
                <PrimaryButton title="Try again" onPress={refresh} />
              </View>
            ) : (
              <View className="gap-3 px-screen py-16">
                <Text className="text-center text-base font-semibold text-foreground dark:text-foreground-dark">
                  No conversations yet
                </Text>
                <Text className="text-center text-sm text-muted dark:text-muted-dark">
                  Open a listing and tap “Message agent” to start chatting.
                </Text>
                <PrimaryButton title="Browse properties" onPress={() => router.navigate('/')} />
              </View>
            )
          }
          contentContainerClassName="pb-8"
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}
