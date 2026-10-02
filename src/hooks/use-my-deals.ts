import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Agent, Deal, Property } from '@/types/database';

const DEAL_SELECT =
  '*, property:properties(id, name, image_url, address), agent:agents(id, name, clerk_user_id), conversation:conversations(id, buyer_name)' as const;

export type DealWithContext = Deal & {
  property: Pick<Property, 'id' | 'name' | 'image_url' | 'address'> | null;
  agent: Pick<Agent, 'id' | 'name' | 'clerk_user_id'> | null;
  conversation: { id: string; buyer_name: string } | null;
};

type UseMyDealsResult = {
  deals: DealWithContext[];
  reviewedDealIds: ReadonlySet<string>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  userId: string | null | undefined;
};

/** Deals the user is part of, as buyer/tenant or as agent (RLS), newest first. */
export function useMyDeals(): UseMyDealsResult {
  const { userId } = useAuth();
  const [deals, setDeals] = useState<DealWithContext[]>([]);
  const [reviewedDealIds, setReviewedDealIds] = useState<ReadonlySet<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    inFlightRef.current?.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;

    Promise.all([
      supabase
        .from('deals')
        .select(DEAL_SELECT)
        .order('updated_at', { ascending: false })
        .abortSignal(controller.signal),
      supabase
        .from('reviews')
        .select('deal_id')
        .eq('user_id', userId)
        .not('deal_id', 'is', null)
        .abortSignal(controller.signal),
    ]).then(([dealsResult, reviewsResult]) => {
      if (controller.signal.aborted) return;
      const queryError = dealsResult.error ?? reviewsResult.error;
      if (queryError) {
        setError(queryError.message);
      } else {
        setDeals(dealsResult.data ?? []);
        setReviewedDealIds(
          new Set((reviewsResult.data ?? []).flatMap((review) => (review.deal_id ? [review.deal_id] : [])))
        );
        setError(null);
      }
      setLoading(false);
    });

    return () => controller.abort();
  }, [userId]);

  useFocusEffect(load);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { deals, reviewedDealIds, loading, error, refresh, userId };
}
