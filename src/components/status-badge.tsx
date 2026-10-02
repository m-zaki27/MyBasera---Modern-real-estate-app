import { Text, View } from 'react-native';

import type { ListingStatus } from '@/types/database';

type StatusBadgeProps = {
  status: ListingStatus;
};

const BADGES: Record<Exclude<ListingStatus, 'active'>, { label: string; className: string }> = {
  under_offer: { label: 'Under offer', className: 'bg-rating' },
  sold: { label: 'Sold', className: 'bg-success' },
  rented: { label: 'Rented', className: 'bg-success' },
};

/** "Under offer" / "Sold" / "Rented" pill; renders nothing for active listings. */
export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'active') return null;
  const badge = BADGES[status];
  return (
    <View className={`rounded-full px-3 py-1 ${badge.className}`}>
      <Text className="text-xs font-bold text-white">{badge.label}</Text>
    </View>
  );
}
