import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Deal } from '@/types/database';

/**
 * The signed-in user's most recent deal on a listing as buyer/tenant (open or closed), so the
 * listing page can show "View your offer" instead of "Make an offer".
 */
export function useMyDealForListing(propertyId: string | undefined): Deal | null {
  const { userId } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!propertyId || !userId) return;
      let cancelled = false;
      supabase
        .from('deals')
        .select('*')
        .eq('property_id', propertyId)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) setDeal(data);
        });
      return () => {
        cancelled = true;
      };
    }, [propertyId, userId])
  );

  return deal;
}
