import { create } from 'zustand';

import type {
  ListingTypeFilter,
  MinRooms,
  PropertySort,
  PropertyTypeFilter,
} from '@/constants/property';

export type ExploreFilters = {
  type: PropertyTypeFilter;
  listingType: ListingTypeFilter;
  priceRange: string;
  minBedrooms: MinRooms;
  minBathrooms: MinRooms;
  facilities: string[];
  sort: PropertySort;
};

type ExploreFiltersState = ExploreFilters & {
  set: (patch: Partial<ExploreFilters>) => void;
  toggleFacility: (facility: string) => void;
  reset: () => void;
};

export const DEFAULT_EXPLORE_FILTERS: ExploreFilters = {
  type: 'All',
  listingType: 'all',
  priceRange: 'any',
  minBedrooms: 0,
  minBathrooms: 0,
  facilities: [],
  sort: 'rating',
};

/**
 * Advanced filters for the Explore tab (list + map). Kept separate from the Home
 * search so Home stays a simple browse. Client-only UI state.
 */
export const useExploreFiltersStore = create<ExploreFiltersState>()((set) => ({
  ...DEFAULT_EXPLORE_FILTERS,
  set: (patch) => set(patch),
  toggleFacility: (facility) =>
    set((state) => ({
      facilities: state.facilities.includes(facility)
        ? state.facilities.filter((item) => item !== facility)
        : [...state.facilities, facility],
    })),
  reset: () => set(DEFAULT_EXPLORE_FILTERS),
}));

/** Picks just the filter values; use with `useShallow` so unrelated store changes don't re-render. */
export function selectExploreFilters(state: ExploreFiltersState): ExploreFilters {
  const { type, listingType, priceRange, minBedrooms, minBathrooms, facilities, sort } = state;
  return { type, listingType, priceRange, minBedrooms, minBathrooms, facilities, sort };
}

/** Number of filters that differ from the defaults (sort doesn't count), for badges. */
export function countActiveFilters(filters: ExploreFilters): number {
  return (
    Number(filters.type !== DEFAULT_EXPLORE_FILTERS.type) +
    Number(filters.listingType !== DEFAULT_EXPLORE_FILTERS.listingType) +
    Number(filters.priceRange !== DEFAULT_EXPLORE_FILTERS.priceRange) +
    Number(filters.minBedrooms !== DEFAULT_EXPLORE_FILTERS.minBedrooms) +
    Number(filters.minBathrooms !== DEFAULT_EXPLORE_FILTERS.minBathrooms) +
    filters.facilities.length
  );
}
