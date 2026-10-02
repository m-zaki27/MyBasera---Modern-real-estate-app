import type { ListingType, PropertyType } from '@/types/database';

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

export type ListingTypeFilter = ListingType | 'all';

export const LISTING_TYPE_OPTIONS: readonly { key: ListingTypeFilter; label: string }[] = [
  { key: 'all', label: 'Buy & rent' },
  { key: 'sale', label: 'For sale' },
  { key: 'rent', label: 'For rent' },
];

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

const LAKH = 100_000;
const CRORE = 10_000_000;

/** Sale price bands, in PKR. */
export const SALE_PRICE_RANGES: readonly PriceRange[] = [
  { key: 'any', label: 'Any price' },
  { key: 'sale-under-50l', label: 'Under 50 Lakh', max: 50 * LAKH },
  { key: 'sale-50l-1cr', label: '50 Lakh – 1 Crore', min: 50 * LAKH, max: CRORE },
  { key: 'sale-1-3cr', label: '1 – 3 Crore', min: CRORE, max: 3 * CRORE },
  { key: 'sale-3-10cr', label: '3 – 10 Crore', min: 3 * CRORE, max: 10 * CRORE },
  { key: 'sale-10cr-plus', label: '10 Crore+', min: 10 * CRORE },
];

/** Monthly rent bands, in PKR. */
export const RENT_PRICE_RANGES: readonly PriceRange[] = [
  { key: 'any', label: 'Any rent' },
  { key: 'rent-under-50k', label: 'Under 50,000', max: 50_000 },
  { key: 'rent-50k-1l', label: '50,000 – 1 Lakh', min: 50_000, max: LAKH },
  { key: 'rent-1-2.5l', label: '1 – 2.5 Lakh', min: LAKH, max: 2.5 * LAKH },
  { key: 'rent-2.5l-plus', label: '2.5 Lakh+', min: 2.5 * LAKH },
];

/** All bands, for looking a key up regardless of buy/rent. */
export const PRICE_RANGES: readonly PriceRange[] = [...SALE_PRICE_RANGES, ...RENT_PRICE_RANGES.slice(1)];

export const MIN_ROOM_OPTIONS = [0, 1, 2, 3, 4, 5] as const;
export type MinRooms = (typeof MIN_ROOM_OPTIONS)[number];

export const SORT_OPTIONS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'price_asc', label: 'Price: low to high' },
  { key: 'price_desc', label: 'Price: high to low' },
  { key: 'newest', label: 'Newest' },
] as const;

export type PropertySort = (typeof SORT_OPTIONS)[number]['key'];
