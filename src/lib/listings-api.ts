import { supabase } from '@/lib/supabase';
import type { TablesInsert } from '@/types/database';

export type AgentProfileSeed = {
  clerkUserId: string;
  name: string;
  email: string | null;
  avatar: string | null;
};

/** The fields a user edits on the listing form. */
export type ListingValues = Pick<
  TablesInsert<'properties'>,
  | 'name'
  | 'type'
  | 'listing_type'
  | 'price'
  | 'address'
  | 'bedrooms'
  | 'bathrooms'
  | 'area'
  | 'facilities'
  | 'image_url'
>;

/**
 * Returns the caller's agent ID, creating their agent profile on first use.
 * RLS only allows inserting a row whose clerk_user_id matches the caller's token.
 */
export async function ensureOwnAgent(seed: AgentProfileSeed): Promise<string> {
  const { data: existing, error: selectError } = await supabase
    .from('agents')
    .select('id')
    .eq('clerk_user_id', seed.clerkUserId)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from('agents')
    .insert({
      clerk_user_id: seed.clerkUserId,
      name: seed.name,
      email: seed.email,
      avatar: seed.avatar,
    })
    .select('id')
    .single();
  if (insertError) throw new Error(insertError.message);
  return created.id;
}

export async function createListing(agentId: string, values: ListingValues): Promise<string> {
  const { data, error } = await supabase
    .from('properties')
    .insert({ ...values, agent_id: agentId })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateListing(propertyId: string, values: ListingValues): Promise<void> {
  const { error, count } = await supabase
    .from('properties')
    .update(values, { count: 'exact' })
    .eq('id', propertyId);
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("This listing couldn't be updated. It may belong to someone else.");
}

export async function deleteListing(propertyId: string): Promise<void> {
  // `count: 'exact'` so an RLS-blocked delete (0 rows) is reported instead of silently "succeeding".
  const { error, count } = await supabase
    .from('properties')
    .delete({ count: 'exact' })
    .eq('id', propertyId);
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("This listing couldn't be deleted. It may belong to someone else.");
}
