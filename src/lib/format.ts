const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}

export function formatArea(area: number): string {
  return `${numberFormatter.format(area)} sqft`;
}
