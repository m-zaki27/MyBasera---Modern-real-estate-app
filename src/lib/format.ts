const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}

/** Short price for map pins: $950, $615K, $1.3M. Hand-rolled because Hermes' Intl compact notation isn't guaranteed. */
export function formatCompactPrice(price: number): string {
  if (price >= 1_000_000) return `$${trimZero((price / 1_000_000).toFixed(1))}M`;
  if (price >= 1_000) return `$${Math.round(price / 1_000)}K`;
  return `$${Math.round(price)}`;
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
