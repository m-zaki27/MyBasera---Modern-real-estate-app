import type { PhotoValue } from '@/components/photo-field';
import { uploadListingPhoto } from '@/lib/storage';

/** Turns the form's photo state into the `image_url` to save, uploading a newly picked photo. */
export async function resolveListingPhoto(clerkUserId: string, photo: PhotoValue): Promise<string | null> {
  switch (photo.kind) {
    case 'picked':
      return uploadListingPhoto(clerkUserId, photo.photo);
    case 'existing':
      return photo.url;
    default:
      return null;
  }
}
