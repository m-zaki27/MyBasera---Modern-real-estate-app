import 'react-native-url-polyfill/auto';

import { getClerkInstance } from '@clerk/expo';
import { createClient } from '@supabase/supabase-js';

import { clerkPublishableKey } from '@/lib/clerk';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY. Add them to .env.local (Supabase Dashboard → Project Settings → API) and restart with `npx expo start --clear`.'
  );
}

/**
 * Supabase client authenticated with the current Clerk session (Supabase third-party auth).
 * Every request sends the Clerk session token, so RLS policies can use `auth.jwt() ->> 'sub'`.
 * Signed-out requests fall back to the publishable key and only see public data.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  async accessToken() {
    const clerk = getClerkInstance({ publishableKey: clerkPublishableKey });
    return (await clerk.session?.getToken()) ?? null;
  },
});
