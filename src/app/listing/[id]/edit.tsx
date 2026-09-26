import { useAuth } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ListingForm, type ListingSubmission } from '@/components/listing-form';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { useProperty } from '@/hooks/use-property';
import { confirmAction, showAlert } from '@/lib/alert';
import { resolveListingPhoto } from '@/lib/listing-photo';
import { deleteListing, updateListing } from '@/lib/listings-api';
import { deleteListingPhoto } from '@/lib/storage';

type CenteredProps = {
  children: ReactNode;
};

function Centered({ children }: CenteredProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-screen dark:bg-background-dark">
      {children}
    </View>
  );
}

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const { property, loading, error, retry } = useProperty(id);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return (
      <Centered>
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </Centered>
    );
  }

  if (error) {
    return (
      <Centered>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{error}</Text>
        <View className="w-full">
          <PrimaryButton title="Try again" onPress={retry} />
        </View>
      </Centered>
    );
  }

  if (!property || !userId || property.agent?.clerk_user_id !== userId) {
    return (
      <Centered>
        <Text className="text-center text-base text-foreground dark:text-foreground-dark">
          You can only edit your own listings.
        </Text>
      </Centered>
    );
  }

  const onSubmit = async ({ values, photo }: ListingSubmission) => {
    const previousImageUrl = property.image_url;
    const imageUrl = await resolveListingPhoto(userId, photo);
    try {
      await updateListing(property.id, { ...values, image_url: imageUrl });
    } catch (err) {
      if (photo.kind === 'picked') await deleteListingPhoto(imageUrl);
      throw err;
    }
    // The old photo is only removed once the listing points at the new one.
    if (previousImageUrl !== imageUrl) await deleteListingPhoto(previousImageUrl);
    router.back();
  };

  const onDelete = async () => {
    const confirmed = await confirmAction({
      title: 'Delete listing?',
      message: `"${property.name}" will be removed for everyone. This can't be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteListing(property.id);
      await deleteListingPhoto(property.image_url);
      // Skip the now-deleted details screen underneath.
      router.dismissTo('/profile');
    } catch (err) {
      showAlert("Couldn't delete listing", err instanceof Error ? err.message : String(err));
      setDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ListingForm
        initial={{
          name: property.name,
          type: property.type,
          listingType: property.listing_type,
          price: property.price,
          address: property.address,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          facilities: property.facilities,
          imageUrl: property.image_url,
        }}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        footer={
          <PrimaryButton title="Delete listing" onPress={onDelete} loading={deleting} variant="outline" />
        }
      />
    </View>
  );
}
