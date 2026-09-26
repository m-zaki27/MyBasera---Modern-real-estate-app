import { create } from 'zustand';

import { addFavorite, fetchFavoriteIds, removeFavorite } from '@/lib/favorites-api';

type FavoritesStatus = 'idle' | 'loading' | 'ready' | 'error';

type FavoritesState = {
  /** Favorited property IDs — a client cache of the `favorites` table for optimistic UI. */
  ids: Record<string, true>;
  /** Property IDs with a save/remove request in flight. */
  pending: Record<string, true>;
  status: FavoritesStatus;
  error: string | null;
  load: () => Promise<void>;
  /** Optimistically flips a favorite, rolling back if Supabase rejects it. */
  toggle: (propertyId: string) => Promise<{ error: string | null }>;
  reset: () => void;
};

const initialState = {
  ids: {},
  pending: {},
  status: 'idle',
  error: null,
} satisfies Partial<FavoritesState>;

// Bumped on reset so responses from a previous user's session are ignored.
let generation = 0;

function without(record: Record<string, true>, key: string): Record<string, true> {
  const { [key]: _removed, ...rest } = record;
  return rest;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  ...initialState,

  load: async () => {
    const loadGeneration = generation;
    set({ status: 'loading', error: null });
    try {
      const ids = await fetchFavoriteIds();
      if (loadGeneration !== generation) return;
      set({
        ids: Object.fromEntries(ids.map((id) => [id, true as const])),
        status: 'ready',
      });
    } catch (err) {
      if (loadGeneration !== generation) return;
      set({ status: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  },

  toggle: async (propertyId) => {
    if (get().pending[propertyId]) return { error: null };

    const toggleGeneration = generation;
    const wasFavorite = Boolean(get().ids[propertyId]);
    set((state) => ({
      ids: wasFavorite ? without(state.ids, propertyId) : { ...state.ids, [propertyId]: true },
      pending: { ...state.pending, [propertyId]: true },
    }));

    try {
      await (wasFavorite ? removeFavorite(propertyId) : addFavorite(propertyId));
      if (toggleGeneration === generation) {
        set((state) => ({ pending: without(state.pending, propertyId) }));
      }
      return { error: null };
    } catch (err) {
      if (toggleGeneration === generation) {
        set((state) => ({
          ids: wasFavorite ? { ...state.ids, [propertyId]: true } : without(state.ids, propertyId),
          pending: without(state.pending, propertyId),
        }));
      }
      return { error: err instanceof Error ? err.message : String(err) };
    }
  },

  reset: () => {
    generation += 1;
    set(initialState);
  },
}));
