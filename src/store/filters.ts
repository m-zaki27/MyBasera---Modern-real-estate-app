import { create } from 'zustand';

import type { PropertyTypeFilter } from '@/constants/property';

type FiltersState = {
  query: string;
  type: PropertyTypeFilter;
  setQuery: (query: string) => void;
  setType: (type: PropertyTypeFilter) => void;
  reset: () => void;
};

const initialFilters = { query: '', type: 'All' } as const;

/** Search/filter state for the property list. Client-only UI state — Supabase stays the source of truth. */
export const useFiltersStore = create<FiltersState>()((set) => ({
  ...initialFilters,
  setQuery: (query) => set({ query }),
  setType: (type) => set({ type }),
  reset: () => set(initialFilters),
}));
