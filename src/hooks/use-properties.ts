import { useCallback, useEffect, useState } from 'react';

import { PRICE_RANGES, type PropertySort, type PropertyTypeFilter } from '@/constants/property';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types/database';

export const LIST_COLUMNS =
  'id, name, type, price, address, latitude, longitude, bedrooms, bathrooms, area, rating, image_url' as const;

export type PropertyListItem = Pick<
  Property,
  | 'id'
  | 'name'
  | 'type'
  | 'price'
  | 'address'
  | 'latitude'
  | 'longitude'
  | 'bedrooms'
  | 'bathrooms'
  | 'area'
  | 'rating'
  | 'image_url'
>;

export type PropertyFilters = {
  query?: string;
  type?: PropertyTypeFilter;
  /** Key from PRICE_RANGES. */
  priceRange?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  /** Listing must have all of these. */
  facilities?: readonly string[];
  sort?: PropertySort;
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

export function useProperties({
  query = '',
  type = 'All',
  priceRange = 'any',
  minBedrooms = 0,
  minBathrooms = 0,
  facilities = [],
  sort = 'rating',
}: PropertyFilters): UsePropertiesResult {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Stable primitive for the effect deps (arrays are new on every render).
  const facilitiesKey = [...facilities].sort().join('|');

  useEffect(() => {
    const controller = new AbortController();

    let request = supabase.from('properties').select(LIST_COLUMNS).abortSignal(controller.signal);

    if (type !== 'All') request = request.eq('type', type);

    const term = toSearchTerm(query);
    if (term) request = request.or(`name.ilike.*${term}*,address.ilike.*${term}*`);

    const range = PRICE_RANGES.find((option) => option.key === priceRange);
    if (range?.min !== undefined) request = request.gte('price', range.min);
    if (range?.max !== undefined) request = request.lt('price', range.max);

    if (minBedrooms > 0) request = request.gte('bedrooms', minBedrooms);
    if (minBathrooms > 0) request = request.gte('bathrooms', minBathrooms);

    const requiredFacilities = facilitiesKey ? facilitiesKey.split('|') : [];
    if (requiredFacilities.length > 0) request = request.contains('facilities', requiredFacilities);

    switch (sort) {
      case 'price_asc':
        request = request.order('price', { ascending: true });
        break;
      case 'price_desc':
        request = request.order('price', { ascending: false });
        break;
      case 'newest':
        request = request.order('created_at', { ascending: false });
        break;
      default:
        request = request.order('rating', { ascending: false });
    }
    request = request.order('name');

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
  }, [query, type, priceRange, minBedrooms, minBathrooms, facilitiesKey, sort, reloadCount]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { properties, loading, refreshing, error, refresh };
}
