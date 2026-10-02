import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { confirmAction, showAlert } from '@/lib/alert';
import { markListingSold, relistListing } from '@/lib/listings-api';
import type { ListingStatus, ListingType } from '@/types/database';

type OwnerListingPanelProps = {
  propertyId: string;
  propertyName: string;
  listingType: ListingType;
  status: ListingStatus;
  /** Reload the listing after a status change. */
  onChanged: () => void;
};

/** Shown to the person who listed the property: edit, mark as sold, or relist. */
export function OwnerListingPanel({ propertyId, propertyName, listingType, status, onChanged }: OwnerListingPanelProps) {
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, failureTitle: string) => {
    setBusy(true);
    try {
      await action();
      onChanged();
    } catch (err) {
      showAlert(failureTitle, err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const onMarkSold = async () => {
    const ok = await confirmAction({
      title: 'Mark as sold?',
      message: `"${propertyName}" will be hidden from Home and Explore, and any offers still being negotiated will be closed. You can relist it later if this was a mistake.`,
      confirmLabel: 'Mark as sold',
    });
    if (ok) await run(() => markListingSold(propertyId), "Couldn't mark as sold");
  };

  const onRelist = async () => {
    const ok = await confirmAction({
      title: 'Relist this property?',
      message: 'It will show on Home and Explore again and can receive new offers.',
      confirmLabel: 'Relist',
    });
    if (ok) await run(() => relistListing(propertyId), "Couldn't relist");
  };

  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
      <View className="flex-row items-center gap-2">
        <SymbolView
          name={{ ios: 'person.badge.key.fill', android: 'admin_panel_settings', web: 'admin_panel_settings' }}
          tintColor={colors.primary.DEFAULT}
          size={18}
        />
        <Text className="flex-1 text-base font-bold text-foreground dark:text-foreground-dark">
          Manage your listing
        </Text>
      </View>

      <PrimaryButton
        title="Edit listing"
        variant="outline"
        onPress={() => router.push({ pathname: '/listing/[id]/edit', params: { id: propertyId } })}
      />

      {listingType === 'sale' && status === 'active' ? (
        <PrimaryButton title="Mark as sold" loading={busy} onPress={onMarkSold} />
      ) : null}

      {listingType === 'sale' && status === 'sold' ? (
        <>
          <Text className="text-sm text-muted dark:text-muted-dark">
            This property is marked as sold and hidden from Home and Explore.
          </Text>
          <PrimaryButton title="Relist property" variant="outline" loading={busy} onPress={onRelist} />
        </>
      ) : null}

      {status === 'under_offer' ? (
        <Text className="text-sm text-muted dark:text-muted-dark">
          You’ve accepted an offer on this property. Finish or cancel that deal from Profile → My
          deals.
        </Text>
      ) : null}
    </View>
  );
}
