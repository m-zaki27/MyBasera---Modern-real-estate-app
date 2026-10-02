import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { InboxItem } from '@/hooks/use-conversations';
import { formatMessageTime } from '@/lib/format';

type ConversationRowProps = {
  conversation: InboxItem;
  myUserId: string;
};

export function ConversationRow({ conversation, myUserId }: ConversationRowProps) {
  const iAmBuyer = conversation.buyer_id === myUserId;
  // Show the other person: the agent if I'm the buyer, the buyer if I'm the agent.
  const otherName = iAmBuyer ? (conversation.agent?.name ?? 'Agent') : conversation.buyer_name;
  const otherAvatar = iAmBuyer ? conversation.agent?.avatar : conversation.buyer_avatar;
  const hasUnread = conversation.unreadCount > 0;

  return (
    <Link href={{ pathname: '/chat/[id]', params: { id: conversation.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Conversation with ${otherName} about ${conversation.property?.name ?? 'a listing'}${
          hasUnread ? `, ${conversation.unreadCount} unread` : ''
        }`}
        className="flex-row items-center gap-3 px-screen py-3 active:bg-surface dark:active:bg-surface-dark">
        <View>
          <Image
            source={otherAvatar ? { uri: otherAvatar } : undefined}
            className="h-12 w-12 rounded-full bg-surface dark:bg-surface-dark"
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
          {conversation.property?.image_url ? (
            <Image
              source={{ uri: conversation.property.image_url }}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-md border-2 border-background dark:border-background-dark"
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text
              className={`flex-1 text-base text-foreground dark:text-foreground-dark ${hasUnread ? 'font-bold' : 'font-semibold'}`}
              numberOfLines={1}>
              {otherName}
            </Text>
            <Text className="text-xs text-muted dark:text-muted-dark">
              {formatMessageTime(conversation.last_message_at)}
            </Text>
          </View>
          <Text className="text-xs text-primary dark:text-primary-300" numberOfLines={1}>
            {iAmBuyer ? '' : 'Your listing · '}
            {conversation.property?.name ?? 'Listing removed'}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text
              className={`flex-1 text-sm ${hasUnread ? 'text-foreground dark:text-foreground-dark' : 'text-muted dark:text-muted-dark'}`}
              numberOfLines={1}>
              {conversation.last_message_preview ?? 'No messages yet'}
            </Text>
            {hasUnread ? (
              <View className="h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5">
                <Text className="text-[11px] font-bold text-white">{conversation.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
