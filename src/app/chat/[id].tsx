import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DealBanner } from '@/components/deal-banner';
import { MessageBubble } from '@/components/message-bubble';
import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/colors';
import { useChat } from '@/hooks/use-chat';
import { showAlert } from '@/lib/alert';
import { sendMessage } from '@/lib/chat-api';
import { formatPrice } from '@/lib/format';

const MAX_LENGTH = 2000;

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const { conversation, messages, deals, loading, error, reload } = useChat(id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/messages'));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (error || !conversation || !userId) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-screen dark:bg-background-dark">
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          {error ?? 'This conversation isn’t available.'}
        </Text>
        <Pressable onPress={goBack} accessibilityRole="button">
          <Text className="font-semibold text-primary">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isBuyer = conversation.buyer_id === userId;
  const otherName = isBuyer ? (conversation.agent?.name ?? 'Agent') : conversation.buyer_name;
  const otherAvatar = isBuyer ? conversation.agent?.avatar : conversation.buyer_avatar;
  const property = conversation.property;

  const onSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await sendMessage(conversation.id, body);
      setDraft('');
      // Realtime delivers the new message; reload is the fallback if the socket is down.
      reload();
    } catch (err) {
      showAlert("Couldn't send message", err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header */}
          <View className="flex-row items-center gap-3 border-b border-border px-3 py-2 dark:border-border-dark">
            <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8} className="p-1">
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                tintColor={isDark ? colors.foreground.dark : colors.foreground.DEFAULT}
                size={22}
              />
            </Pressable>
            <Image
              source={otherAvatar ? { uri: otherAvatar } : undefined}
              className="h-9 w-9 rounded-full bg-surface dark:bg-surface-dark"
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground dark:text-foreground-dark" numberOfLines={1}>
                {otherName}
              </Text>
              <Text className="text-xs text-muted dark:text-muted-dark">{isBuyer ? 'Agent' : 'Interested in your listing'}</Text>
            </View>
          </View>

          {/* Listing context */}
          {property ? (
            <Link href={{ pathname: '/property/[id]', params: { id: property.id } }} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${property.name}, view listing`}
                className="flex-row items-center gap-3 px-screen py-3 active:opacity-80">
                <Image
                  source={property.image_url ? { uri: property.image_url } : undefined}
                  className="h-12 w-16 rounded-field bg-surface dark:bg-surface-dark"
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark" numberOfLines={1}>
                    {property.name}
                  </Text>
                  <Text className="text-sm text-primary">{formatPrice(property.price, property.listing_type)}</Text>
                </View>
                <StatusBadge status={property.status} />
              </Pressable>
            </Link>
          ) : null}

          <DealBanner conversation={conversation} deals={deals} mySide={isBuyer ? 'buyer' : 'agent'} />

          {/* Messages, newest at the bottom */}
          <FlatList
            className="flex-1"
            data={[...messages].reverse()}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} isMine={item.sender_id === userId} />}
            contentContainerClassName="gap-2 px-screen py-3"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text className="text-center text-sm text-muted dark:text-muted-dark">
                Say hello and ask about the property — viewing times, price, availability.
              </Text>
            }
          />

          {/* Composer */}
          <View className="flex-row items-end gap-2 border-t border-border px-3 py-2 dark:border-border-dark">
            <TextInput
              className="max-h-32 flex-1 rounded-2xl bg-surface px-4 py-2.5 text-base text-foreground dark:bg-surface-dark dark:text-foreground-dark"
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message"
              placeholderTextColor={colors.muted.dark}
              multiline
              maxLength={MAX_LENGTH}
              accessibilityLabel="Message"
            />
            <Pressable
              onPress={onSend}
              disabled={!draft.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              className={`h-11 w-11 items-center justify-center rounded-full bg-primary ${
                !draft.trim() || sending ? 'opacity-40' : 'active:opacity-80'
              }`}>
              {sending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <SymbolView
                  name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                  tintColor={colors.white}
                  size={18}
                />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
