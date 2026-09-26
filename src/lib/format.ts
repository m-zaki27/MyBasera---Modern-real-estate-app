import type { ListingType } from '@/types/database';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatPrice(price: number, listingType: ListingType = 'sale'): string {
  const formatted = currencyFormatter.format(price);
  return listingType === 'rent' ? `${formatted}/mo` : formatted;
}

/** Short price for map pins: $950, $615K, $1.3M. Hand-rolled because Hermes' Intl compact notation isn't guaranteed. */
export function formatCompactPrice(price: number, listingType: ListingType = 'sale'): string {
  const suffix = listingType === 'rent' ? '/mo' : '';
  if (price >= 1_000_000) return `$${trimZero((price / 1_000_000).toFixed(1))}M${suffix}`;
  if (price >= 10_000) return `$${Math.round(price / 1_000)}K${suffix}`;
  if (price >= 1_000) return `$${trimZero((price / 1_000).toFixed(1))}K${suffix}`;
  return `$${Math.round(price)}${suffix}`;
}

function trimZero(value: string): string {
  return value.endsWith('.0') ? value.slice(0, -2) : value;
}

export function formatArea(area: number): string {
  return `${numberFormatter.format(area)} sqft`;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
