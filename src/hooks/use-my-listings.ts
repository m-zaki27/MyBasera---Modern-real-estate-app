import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { LIST_COLUMNS, type PropertyListItem } from '@/hooks/use-properties';
import { supabase } from '@/lib/supabase';

type UseMyListingsResult = {
  listings: PropertyListItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/** Listings owned by the signed-in user's agent profile (empty until they post one). */
export function useMyListings(): UseMyListingsResult {
  const { userId } = useAuth();
  const [listings, setListings] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);

  // Starts a fetch (cancelling any still in flight) and returns its cleanup.
  const load = useCallback(() => {
    if (!userId) return;
    inFlightRef.current?.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;

    supabase
      .from('agents')
      .select(`id, properties(${LIST_COLUMNS})`)
      .eq('clerk_user_id', userId)
      .order('created_at', { referencedTable: 'properties', ascending: false })
      .abortSignal(controller.signal)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (controller.signal.aborted) return;
        if (queryError) {
          setError(queryError.message);
        } else {
          setListings(data?.properties ?? []);
          setError(null);
        }
        setLoading(false);
      });

    return () => controller.abort();
  }, [userId]);

  // Refetch whenever the screen regains focus, e.g. after creating or editing a listing.
  useFocusEffect(load);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { listings, loading, error, refresh };
}
