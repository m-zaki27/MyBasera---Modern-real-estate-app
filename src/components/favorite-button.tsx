import { SymbolView } from 'expo-symbols';
import { Pressable, type GestureResponderEvent } from 'react-native';

import { colors } from '@/constants/colors';
import { showAlert } from '@/lib/alert';
import { useFavoritesStore } from '@/store/favorites';

type FavoriteButtonProps = {
  propertyId: string;
  propertyName: string;
  size?: 'sm' | 'md';
};

export function FavoriteButton({ propertyId, propertyName, size = 'sm' }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) => Boolean(state.ids[propertyId]));
  const isPending = useFavoritesStore((state) => Boolean(state.pending[propertyId]));
  const toggle = useFavoritesStore((state) => state.toggle);

  const onPress = async (event: GestureResponderEvent) => {
    // The button sits inside a card link; don't let the press open the details screen (web).
    event.preventDefault();
    event.stopPropagation();

    const { error } = await toggle(propertyId);
    if (error) {
      showAlert(isFavorite ? "Couldn't remove favorite" : "Couldn't save favorite", error);
    }
  };

  const dimensions = size === 'md' ? 'h-10 w-10' : 'h-8 w-8';

  return (
    <Pressable
      onPress={onPress}
      disabled={isPending}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite, busy: isPending }}
      accessibilityLabel={
        isFavorite ? `Remove ${propertyName} from favorites` : `Save ${propertyName} to favorites`
      }
      hitSlop={8}
      // Material icons on Android/web have no filled heart, so "saved" is shown as a red chip.
      className={`${dimensions} items-center justify-center rounded-full active:opacity-70 ${
        isFavorite ? 'bg-danger' : 'bg-background/90 dark:bg-background-dark/90'
      }`}>
      <SymbolView
        name={
          isFavorite
            ? { ios: 'heart.fill', android: 'favorite', web: 'favorite' }
            : { ios: 'heart', android: 'favorite_border', web: 'favorite_border' }
        }
        tintColor={isFavorite ? colors.white : colors.muted.DEFAULT}
        size={size === 'md' ? 20 : 16}
      />
    </Pressable>
  );
}
