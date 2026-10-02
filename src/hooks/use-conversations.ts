import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Agent, Conversation, Property } from '@/types/database';

export const CONVERSATION_SELECT =
  'id, property_id, agent_id, buyer_id, buyer_name, buyer_avatar, created_at, last_message_at, last_message_preview, property:properties(id, name, image_url, address, price, listing_type, status), agent:agents(id, name, avatar, clerk_user_id)' as const;

export type ConversationWithContext = Conversation & {
  property: Pick<
    Property,
    'id' | 'name' | 'image_url' | 'address' | 'price' | 'listing_type' | 'status'
  > | null;
  agent: Pick<Agent, 'id' | 'name' | 'avatar' | 'clerk_user_id'> | null;
};

export type InboxItem = ConversationWithContext & {
  unreadCount: number;
};

type UseConversationsResult = {
  conversations: InboxItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/** The signed-in user's conversations (as buyer/tenant or as agent), newest first, live. */
export function useConversations(): UseConversationsResult {
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    inFlightRef.current?.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;

    // RLS returns only conversations the user takes part in.
    Promise.all([
      supabase
        .from('conversations')
        .select(CONVERSATION_SELECT)
        .order('last_message_at', { ascending: false })
        .abortSignal(controller.signal),
      supabase
        .from('messages')
        .select('conversation_id')
        .is('read_at', null)
        .neq('sender_id', userId)
        .abortSignal(controller.signal),
    ]).then(([conversationsResult, unreadResult]) => {
      if (controller.signal.aborted) return;
      const queryError = conversationsResult.error ?? unreadResult.error;
      if (queryError) {
        setError(queryError.message);
      } else {
        const unread = new Map<string, number>();
        for (const row of unreadResult.data ?? []) {
          unread.set(row.conversation_id, (unread.get(row.conversation_id) ?? 0) + 1);
        }
        setConversations(
          (conversationsResult.data ?? []).map((conversation) => ({
            ...conversation,
            unreadCount: unread.get(conversation.id) ?? 0,
          }))
        );
        setError(null);
      }
      setLoading(false);
    });

    return () => controller.abort();
  }, [userId]);

  useFocusEffect(load);

  // Live: any new message or conversation change for this user refreshes the inbox.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`inbox:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { conversations, loading, error, refresh };
}
