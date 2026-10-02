import { Text, View } from 'react-native';

import { formatMessageTime } from '@/lib/format';
import type { Message } from '@/types/database';

type MessageBubbleProps = {
  message: Message;
  isMine: boolean;
};

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <View className={`max-w-[80%] gap-1 ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
      <View
        className={`rounded-2xl px-4 py-2.5 ${
          isMine ? 'rounded-br-md bg-primary' : 'rounded-bl-md bg-surface dark:bg-surface-dark'
        }`}>
        <Text
          className={`text-base leading-5 ${isMine ? 'text-white' : 'text-foreground dark:text-foreground-dark'}`}>
          {message.body}
        </Text>
      </View>
      <Text className="px-1 text-[11px] text-muted dark:text-muted-dark">
        {formatMessageTime(message.created_at)}
        {isMine && message.read_at ? ' · Seen' : ''}
      </Text>
    </View>
  );
}
