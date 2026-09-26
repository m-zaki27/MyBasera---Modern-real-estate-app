import { supabase } from '@/lib/supabase';

export const LISTING_PHOTOS_BUCKET = 'property-images';

/** Matches the bucket's file_size_limit in supabase/migrations. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export type PickedPhoto = {
  base64: string;
  mimeType: string;
};

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/** Approximate decoded size of a base64 string, without decoding it. */
export function base64ByteLength(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

// Supabase Storage uploads from React Native must be an ArrayBuffer/typed array
// (Blob, File and FormData don't work there). Hermes provides atob.
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Uploads a listing photo to `property-images/<clerkUserId>/<random>.<ext>` — the
 * folder Storage RLS lets this user write to — and returns its public URL.
 */
export async function uploadListingPhoto(clerkUserId: string, photo: PickedPhoto): Promise<string> {
  if (base64ByteLength(photo.base64) > MAX_PHOTO_BYTES) {
    throw new Error('That photo is larger than 5 MB. Please choose a smaller one.');
  }

  const extension = EXTENSIONS[photo.mimeType] ?? 'jpg';
  const path = `${clerkUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { error } = await supabase.storage
    .from(LISTING_PHOTOS_BUCKET)
    .upload(path, base64ToBytes(photo.base64), { contentType: photo.mimeType, upsert: false });
  if (error) throw new Error(error.message);

  return supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Removes a photo previously uploaded by this app. URLs from elsewhere (e.g. seed data) are ignored. */
export async function deleteListingPhoto(publicUrl: string | null): Promise<void> {
  if (!publicUrl) return;
  const marker = `/object/public/${LISTING_PHOTOS_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(publicUrl.slice(index + marker.length));
  const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove([path]);
  // A leftover file isn't worth failing the user's action over.
  if (error) console.warn(`Couldn't remove old listing photo: ${error.message}`);
}
