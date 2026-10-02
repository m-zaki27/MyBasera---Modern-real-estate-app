import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { CONVERSATION_SELECT, type ConversationWithContext } from '@/hooks/use-conversations';
import { markConversationRead } from '@/lib/chat-api';
import { supabase } from '@/lib/supabase';
import type { Deal, Message } from '@/types/database';

type UseChatResult = {
  conversation: ConversationWithContext | null;
  messages: Message[];
  /** Newest first. */
  deals: Deal[];
  reviewedDealIds: ReadonlySet<string>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Adds a message immediately (before realtime echoes it back). */
  appendMessage: (message: Message) => void;
};

const MESSAGE_LIMIT = 300;

/** One conversation's details, messages and deals, kept live with Supabase Realtime. */
export function useChat(conversationId: string | undefined): UseChatResult {
  const { userId } = useAuth();
  const [conversation, setConversation] = useState<ConversationWithContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [reviewedDealIds, setReviewedDealIds] = useState<ReadonlySet<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appendMessage = useCallback((message: Message) => {
    setMessages((current) =>
      current.some((existing) => existing.id === message.id) ? current : [...current, message]
    );
  }, []);

  const loadDealsAndListing = useCallback(async () => {
    if (!conversationId) return;
    const [conversationResult, dealsResult] = await Promise.all([
      supabase.from('conversations').select(CONVERSATION_SELECT).eq('id', conversationId).maybeSingle(),
      supabase
        .from('deals')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false }),
    ]);
    if (conversationResult.error || dealsResult.error) {
      setError((conversationResult.error ?? dealsResult.error)?.message ?? 'Something went wrong.');
      return;
    }
    setConversation(conversationResult.data);
    setDeals(dealsResult.data);

    const dealIds = dealsResult.data.map((deal) => deal.id);
    if (dealIds.length > 0) {
      const { data: reviews } = await supabase.from('reviews').select('deal_id').in('deal_id', dealIds);
      setReviewedDealIds(new Set((reviews ?? []).flatMap((review) => (review.deal_id ? [review.deal_id] : []))));
    }
  }, [conversationId]);

  const reload = useCallback(async () => {
    if (!conversationId) return;
    const [, messagesResult] = await Promise.all([
      loadDealsAndListing(),
      supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(MESSAGE_LIMIT),
    ]);
    if (messagesResult.error) {
      setError(messagesResult.error.message);
    } else {
      setMessages(messagesResult.data);
    }
    setLoading(false);
    if (userId) markConversationRead(conversationId, userId);
  }, [conversationId, loadDealsAndListing, userId]);

  // Load on focus too, e.g. so a just-posted review shows when returning from that screen.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as Message;
          appendMessage(message);
          if (userId && message.sender_id !== userId) markConversationRead(conversationId, userId);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals', filter: `conversation_id=eq.${conversationId}` },
        () => {
          // A proposal, confirmation or cancellation also changes the listing's status.
          loadDealsAndListing();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, appendMessage, loadDealsAndListing]);

  return {
    conversation,
    messages,
    deals,
    reviewedDealIds,
    loading,
    error,
    reload,
    appendMessage,
  };
}
