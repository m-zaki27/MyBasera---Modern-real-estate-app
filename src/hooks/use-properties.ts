import { useCallback, useEffect, useState } from 'react';

import type { PropertyTypeFilter } from '@/constants/property';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types/database';

export const LIST_COLUMNS =
  'id, name, type, price, address, bedrooms, bathrooms, area, rating, image_url' as const;

export type PropertyListItem = Pick<
  Property,
  'id' | 'name' | 'type' | 'price' | 'address' | 'bedrooms' | 'bathrooms' | 'area' | 'rating' | 'image_url'
>;

type PropertyFilters = {
  query: string;
  type: PropertyTypeFilter;
};

type UsePropertiesResult = {
  properties: PropertyListItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
};

// PostgREST `or()` filters are comma/paren-delimited and `*`/`%` are wildcards,
// so strip those from user input rather than letting them change the query.
function toSearchTerm(query: string): string {
  return query.replace(/[,()*%\\]/g, ' ').trim();
}

export function useProperties({ query, type }: PropertyFilters): UsePropertiesResult {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    let request = supabase
      .from('properties')
      .select(LIST_COLUMNS)
      .order('rating', { ascending: false })
      .order('name')
      .abortSignal(controller.signal);

    if (type !== 'All') {
      request = request.eq('type', type);
    }

    const term = toSearchTerm(query);
    if (term) {
      request = request.or(`name.ilike.*${term}*,address.ilike.*${term}*`);
    }

    request.then(({ data, error: queryError }) => {
      if (controller.signal.aborted) return;
      if (queryError) {
        setError(queryError.message);
      } else {
        setProperties(data);
        setError(null);
      }
      setLoading(false);
      setRefreshing(false);
    });

    return () => controller.abort();
  }, [query, type, reloadCount]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { properties, loading, refreshing, error, refresh };
}
