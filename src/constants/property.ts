import type { PropertyType } from '@/types/database';

export const PROPERTY_TYPES: readonly PropertyType[] = [
  'House',
  'Apartment',
  'Villa',
  'Condo',
  'Townhouse',
  'Studio',
];

export type PropertyTypeFilter = PropertyType | 'All';

export const PROPERTY_TYPE_FILTERS: readonly PropertyTypeFilter[] = ['All', ...PROPERTY_TYPES];

/** Facilities offered as filters; values match `properties.facilities` entries. */
export const FACILITIES = [
  'Pool',
  'Parking',
  'Gym',
  'Garden',
  'Laundry',
  'Wifi',
  'Elevator',
  'Pet Friendly',
] as const;

export type PriceRange = {
  key: string;
  label: string;
  /** Inclusive lower bound. */
  min?: number;
  /** Exclusive upper bound. */
  max?: number;
};

export const PRICE_RANGES: readonly PriceRange[] = [
  { key: 'any', label: 'Any price' },
  { key: 'under-500k', label: 'Under $500k', max: 500_000 },
  { key: '500k-1m', label: '$500k – $1M', min: 500_000, max: 1_000_000 },
  { key: '1m-3m', label: '$1M – $3M', min: 1_000_000, max: 3_000_000 },
  { key: '3m-plus', label: '$3M+', min: 3_000_000 },
];

export const MIN_ROOM_OPTIONS = [0, 1, 2, 3, 4, 5] as const;
export type MinRooms = (typeof MIN_ROOM_OPTIONS)[number];

export const SORT_OPTIONS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'price_asc', label: 'Price: low to high' },
  { key: 'price_desc', label: 'Price: high to low' },
  { key: 'newest', label: 'Newest' },
] as const;

export type PropertySort = (typeof SORT_OPTIONS)[number]['key'];
