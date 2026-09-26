import { supabase } from '@/lib/supabase';

// `user_id` defaults to the Clerk user ID from the JWT and RLS limits every query
// to the caller's own rows, so none of these need to pass a user ID.

const UNIQUE_VIOLATION = '23505';

export async function fetchFavoriteIds(): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('property_id');
  if (error) throw new Error(error.message);
  return data.map((row) => row.property_id);
}

export async function addFavorite(propertyId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({ property_id: propertyId });
  // Already favorited (e.g. from another device): the end state is what we wanted.
  if (error && error.code !== UNIQUE_VIOLATION) throw new Error(error.message);
}

export async function removeFavorite(propertyId: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('property_id', propertyId);
  if (error) throw new Error(error.message);
}
