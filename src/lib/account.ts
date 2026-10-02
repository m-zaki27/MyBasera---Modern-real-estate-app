import type { UserResource } from '@clerk/expo/types';

import { LISTING_PHOTOS_BUCKET } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

async function run(step: string, action: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await action;
  if (error) throw new Error(`Couldn't delete your ${step}: ${error.message}`);
}

/**
 * Deletes everything the user owns in Supabase (RLS scopes every delete to them), then
 * their Clerk account. Supabase data goes first so a failure leaves the account intact
 * and the user can retry, rather than leaving orphaned data behind a deleted account.
 */
export async function deleteAccount(user: UserResource): Promise<void> {
  const userId = user.id;

  // Listing photos live in the user's own Storage folder.
  const { data: photos, error: listError } = await supabase.storage
    .from(LISTING_PHOTOS_BUCKET)
    .list(userId, { limit: 1000 });
  if (listError) throw new Error(`Couldn't list your photos: ${listError.message}`);
  if (photos.length > 0) {
    await run(
      'photos',
      supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(photos.map((photo) => `${userId}/${photo.name}`))
    );
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();
  if (agentError) throw new Error(agentError.message);

  if (agent) {
    // Listings cascade to their favorites, reviews, conversations and deals.
    await run('listings', supabase.from('properties').delete().eq('agent_id', agent.id));
    await run('agent profile', supabase.from('agents').delete().eq('id', agent.id));
  }

  // Conversations the user started (cascades to their messages and deals).
  await run('conversations', supabase.from('conversations').delete().eq('buyer_id', userId));
  await run('favorites', supabase.from('favorites').delete().eq('user_id', userId));
  await run('reviews', supabase.from('reviews').delete().eq('user_id', userId));

  await user.delete();
}
