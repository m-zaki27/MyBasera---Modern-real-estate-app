import { create } from 'zustand';

import type { MinRooms, PropertySort, PropertyTypeFilter } from '@/constants/property';

type ExploreFilters = {
  type: PropertyTypeFilter;
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

/** Number of filters that differ from the defaults (sort doesn't count), for badges. */
export function countActiveFilters(filters: ExploreFilters): number {
  return (
    Number(filters.type !== DEFAULT_EXPLORE_FILTERS.type) +
    Number(filters.priceRange !== DEFAULT_EXPLORE_FILTERS.priceRange) +
    Number(filters.minBedrooms !== DEFAULT_EXPLORE_FILTERS.minBedrooms) +
    Number(filters.minBathrooms !== DEFAULT_EXPLORE_FILTERS.minBathrooms) +
    filters.facilities.length
  );
}
