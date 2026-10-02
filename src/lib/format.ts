import type { ListingType } from '@/types/database';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const LAKH = 100_000;
const CRORE = 10_000_000;

/** Up to two decimals, without trailing zeros: 6.5, 1.25, 45. */
function trimDecimals(value: number): string {
  return String(Number(value.toFixed(2)));
}

/**
 * Prices in Pakistani rupees, the way Pakistani property listings show them:
 * "PKR 6.5 Crore", "PKR 45 Lakh", "PKR 85,000/mo".
 */
export function formatPrice(price: number, listingType: ListingType = 'sale'): string {
  let amount: string;
  if (price >= CRORE) amount = `${trimDecimals(price / CRORE)} Crore`;
  else if (price >= LAKH) amount = `${trimDecimals(price / LAKH)} Lakh`;
  else amount = numberFormatter.format(price);
  return `PKR ${amount}${listingType === 'rent' ? '/mo' : ''}`;
}

/** Short price for map pins: 6.5 Cr, 45 Lac, 85K. */
export function formatCompactPrice(price: number, listingType: ListingType = 'sale'): string {
  let amount: string;
  if (price >= CRORE) amount = `${trimDecimals(price / CRORE)} Cr`;
  else if (price >= LAKH) amount = `${trimDecimals(price / LAKH)} Lac`;
  else if (price >= 1_000) amount = `${Math.round(price / 1_000)}K`;
  else amount = String(Math.round(price));
  return `${amount}${listingType === 'rent' ? '/mo' : ''}`;
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

const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/** Chat timestamps: a time for today ("3:45 PM"), otherwise a short date ("Oct 2"). */
export function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday ? timeFormatter.format(date) : shortDateFormatter.format(date);
}
