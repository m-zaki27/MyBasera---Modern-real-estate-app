import { useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { View } from 'react-native';

import { EMPTY_LISTING, ListingForm, type ListingSubmission } from '@/components/listing-form';
import { resolveListingPhoto } from '@/lib/listing-photo';
import { createListing, ensureOwnAgent } from '@/lib/listings-api';
import { deleteListingPhoto } from '@/lib/storage';

export default function NewListingScreen() {
  const { user } = useUser();

  const onSubmit = async ({ values, photo }: ListingSubmission) => {
    if (!user) throw new Error('You need to be signed in to post a listing.');

    const email = user.primaryEmailAddress?.emailAddress ?? null;
    // First listing: this creates the user's agent profile from their Clerk account.
    const agentId = await ensureOwnAgent({
      clerkUserId: user.id,
      name: user.fullName || email?.split('@')[0] || 'New agent',
      email,
      avatar: user.hasImage ? user.imageUrl : null,
    });

    const imageUrl = await resolveListingPhoto(user.id, photo);
    try {
      const propertyId = await createListing(agentId, { ...values, image_url: imageUrl });
      router.replace({ pathname: '/property/[id]', params: { id: propertyId } });
    } catch (err) {
      // Don't leave an orphaned upload behind if the listing itself failed.
      if (photo.kind === 'picked') await deleteListingPhoto(imageUrl);
      throw err;
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ListingForm initial={EMPTY_LISTING} submitLabel="Publish listing" onSubmit={onSubmit} />
    </View>
  );
}
