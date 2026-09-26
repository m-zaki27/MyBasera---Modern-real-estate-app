import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Agent, Property, Review } from '@/types/database';

// Reviews are only readable by signed-in users (RLS), so this query is also the
// first one that depends on the Clerk → Supabase third-party auth integration.
const DETAIL_SELECT =
  '*, agent:agents(id, name, avatar, email, phone), reviews(id, rating, comment, created_at)' as const;

export type PropertyDetail = Property & {
  agent: Pick<Agent, 'id' | 'name' | 'avatar' | 'email' | 'phone'> | null;
  reviews: Pick<Review, 'id' | 'rating' | 'comment' | 'created_at'>[];
};

type UsePropertyResult = {
  property: PropertyDetail | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

// Postgres rejects malformed UUIDs with 22P02; treat that as "not found", not an error.
const INVALID_TEXT_REPRESENTATION = '22P02';

export function useProperty(id: string | undefined): UsePropertyResult {
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    supabase
      .from('properties')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .order('created_at', { referencedTable: 'reviews', ascending: false })
      .abortSignal(controller.signal)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (controller.signal.aborted) return;
        if (queryError && queryError.code !== INVALID_TEXT_REPRESENTATION) {
          setError(queryError.message);
        } else {
          setProperty(data);
          setError(null);
        }
        setLoading(false);
      });

    return () => controller.abort();
  }, [id, attempt]);

  const retry = useCallback(() => {
    setLoading(true);
    setAttempt((count) => count + 1);
  }, []);

  return { property, loading: Boolean(id) && loading, error, retry };
}
