import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Agent, Deal, DealEvent, Property } from '@/types/database';

const DEAL_DETAIL_SELECT =
  '*, property:properties(id, name, image_url, address, price, listing_type, status), agent:agents(id, name, avatar, clerk_user_id), conversation:conversations(id, buyer_name, buyer_avatar)' as const;

export type DealDetail = Deal & {
  property: Pick<Property, 'id' | 'name' | 'image_url' | 'address' | 'price' | 'listing_type' | 'status'> | null;
  agent: Pick<Agent, 'id' | 'name' | 'avatar' | 'clerk_user_id'> | null;
  conversation: { id: string; buyer_name: string; buyer_avatar: string | null } | null;
};

type UseDealResult = {
  deal: DealDetail | null;
  events: DealEvent[];
  hasReviewed: boolean;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/** A deal with its full offer history, kept live with Supabase Realtime. */
export function useDeal(dealId: string | undefined): UseDealResult {
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [events, setEvents] = useState<DealEvent[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!dealId) return;
    const [dealResult, eventsResult, reviewResult] = await Promise.all([
      supabase.from('deals').select(DEAL_DETAIL_SELECT).eq('id', dealId).maybeSingle(),
      supabase.from('deal_events').select('*').eq('deal_id', dealId).order('created_at', { ascending: true }),
      supabase.from('reviews').select('id').eq('deal_id', dealId).maybeSingle(),
    ]);
    const queryError = dealResult.error ?? eventsResult.error ?? reviewResult.error;
    if (queryError) {
      setError(queryError.message);
    } else {
      setDeal(dealResult.data);
      setEvents(eventsResult.data ?? []);
      setHasReviewed(Boolean(reviewResult.data));
      setError(null);
    }
    setLoading(false);
  }, [dealId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  useEffect(() => {
    if (!dealId) return;
    const channel = supabase
      .channel(`deal:${dealId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals', filter: `id=eq.${dealId}` }, () => reload())
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deal_events', filter: `deal_id=eq.${dealId}` },
        () => reload()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, reload]);

  return { deal, events, hasReviewed, loading, error, reload };
}
