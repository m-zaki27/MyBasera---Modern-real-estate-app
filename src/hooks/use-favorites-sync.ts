import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import { useFavoritesStore } from '@/store/favorites';

/**
 * Keeps the favorites cache tied to the signed-in Clerk user: loads it on sign-in,
 * clears it on sign-out or user switch. Mount once, near the root.
 */
export function useFavoritesSync(): void {
  const { isLoaded, userId } = useAuth();
  const load = useFavoritesStore((state) => state.load);
  const reset = useFavoritesStore((state) => state.reset);

  useEffect(() => {
    if (!isLoaded) return;
    reset();
    if (userId) load();
  }, [isLoaded, userId, load, reset]);
}
