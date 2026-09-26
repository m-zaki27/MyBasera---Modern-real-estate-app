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
