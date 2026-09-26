import { useCallback, useEffect, useState } from 'react';

import { LIST_COLUMNS, type PropertyListItem } from '@/hooks/use-properties';
import { supabase } from '@/lib/supabase';
import { useFavoritesStore } from '@/store/favorites';

const FAVORITES_SELECT = `created_at, property:properties(${LIST_COLUMNS})` as const;

type UseFavoritePropertiesResult = {
  properties: PropertyListItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Favorited properties, newest first. Refetches whenever the favorites cache changes,
 * and hides un-favorited items immediately so removals feel instant.
 */
export function useFavoriteProperties(): UseFavoritePropertiesResult {
  const ids = useFavoritesStore((state) => state.ids);
  const cacheStatus = useFavoritesStore((state) => state.status);
  const cacheError = useFavoritesStore((state) => state.error);
  const reloadCache = useFavoritesStore((state) => state.load);

  const [fetched, setFetched] = useState<PropertyListItem[]>([]);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const idsKey = Object.keys(ids).sort().join(',');

  useEffect(() => {
    if (cacheStatus !== 'ready' || !idsKey) return;
    const controller = new AbortController();

    supabase
      .from('favorites')
      .select(FAVORITES_SELECT)
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal)
      .then(({ data, error: queryError }) => {
        if (controller.signal.aborted) return;
        if (queryError) {
          setError(queryError.message);
        } else {
          setFetched(data.flatMap((row) => (row.property ? [row.property] : [])));
          setError(null);
        }
        setFetchedKey(idsKey);
        setRefreshing(false);
      });

    return () => controller.abort();
  }, [cacheStatus, idsKey, reloadCount]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadCount((count) => count + 1);
    reloadCache().finally(() => setRefreshing(false));
  }, [reloadCache]);

  const hasFavorites = idsKey !== '';
  const properties = hasFavorites ? fetched.filter((property) => ids[property.id]) : [];
  const loading =
    cacheStatus === 'idle' ||
    cacheStatus === 'loading' ||
    (cacheStatus === 'ready' && hasFavorites && fetchedKey === null);

  return {
    properties,
    loading,
    refreshing,
    error: cacheStatus === 'error' ? cacheError : hasFavorites ? error : null,
    refresh,
  };
}
