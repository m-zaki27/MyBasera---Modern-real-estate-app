import { supabase } from '@/lib/supabase';

type AgentProfilePatch = {
  name?: string;
  avatar?: string | null;
};

/**
 * Mirrors Clerk profile changes onto the user's agent row (if they have one), so their
 * listings show the same name and photo. RLS limits the update to their own row.
 */
export async function syncAgentProfile(clerkUserId: string, patch: AgentProfilePatch): Promise<void> {
  const { error } = await supabase.from('agents').update(patch).eq('clerk_user_id', clerkUserId);
  // Not fatal: the Clerk profile already changed, and the next sync will catch up.
  if (error) console.warn(`Couldn't sync agent profile: ${error.message}`);
}
