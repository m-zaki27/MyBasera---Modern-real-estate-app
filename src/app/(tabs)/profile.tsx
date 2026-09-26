import { useClerk, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { MyListingRow } from '@/components/my-listing-row';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { useMyListings } from '@/hooks/use-my-listings';
import { getClerkErrorMessage } from '@/lib/clerk-errors';
import { formatDate } from '@/lib/format';
import { useFavoritesStore } from '@/store/favorites';

type SaveMessage = {
  tone: 'success' | 'error';
  text: string;
};

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const favoriteCount = useFavoritesStore((state) => Object.keys(state.ids).length);
  const myListings = useMyListings();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress;
  const nameChanged =
    firstName.trim() !== (user.firstName ?? '') || lastName.trim() !== (user.lastName ?? '');

  const onSaveName = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setSaveMessage({ tone: 'success', text: 'Name updated.' });
    } catch (err) {
      setSaveMessage({ tone: 'error', text: getClerkErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      // The root layout's Stack.Protected guard moves the user back to sign-in.
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerClassName="gap-8 px-screen pb-10 pt-2"
            keyboardShouldPersistTaps="handled">
            <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
              Profile
            </Text>

            <View className="items-center gap-3">
              <Image
                source={{ uri: user.imageUrl }}
                className="h-24 w-24 rounded-full bg-surface dark:bg-surface-dark"
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
              <View className="items-center gap-1">
                <Text className="text-xl font-bold text-foreground dark:text-foreground-dark">
                  {user.fullName || 'Add your name'}
                </Text>
                {email ? (
                  <Text className="text-sm text-muted dark:text-muted-dark">{email}</Text>
                ) : null}
                {user.createdAt ? (
                  <Text className="text-xs text-muted dark:text-muted-dark">
                    Member since {formatDate(user.createdAt.toISOString())}
                  </Text>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={() => router.navigate('/favorites')}
              accessibilityRole="button"
              accessibilityLabel={`${favoriteCount} saved properties, open favorites`}
              className="flex-row items-center gap-3 rounded-card bg-surface p-4 active:opacity-80 dark:bg-surface-dark">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-danger">
                <SymbolView
                  name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
                  tintColor={colors.white}
                  size={18}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
                  {favoriteCount} saved {favoriteCount === 1 ? 'property' : 'properties'}
                </Text>
                <Text className="text-sm text-muted dark:text-muted-dark">View your favorites</Text>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                tintColor={colors.muted.DEFAULT}
                size={18}
              />
            </Pressable>

            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
                My listings
              </Text>
              {myListings.loading ? (
                <ActivityIndicator color={colors.primary.DEFAULT} />
              ) : myListings.error ? (
                <Text className="text-sm text-danger-text dark:text-danger-text-dark">
                  {myListings.error}
                </Text>
              ) : myListings.listings.length === 0 ? (
                <Text className="text-sm text-muted dark:text-muted-dark">
                  You haven&apos;t listed a property yet.
                </Text>
              ) : (
                myListings.listings.map((listing) => (
                  <MyListingRow key={listing.id} listing={listing} />
                ))
              )}
              <PrimaryButton title="List a property" onPress={() => router.push('/listing/new')} />
            </View>

            <View className="gap-4">
              <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
                Your name
              </Text>
              <FormField
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoComplete="given-name"
                textContentType="givenName"
                placeholder="Jane"
              />
              <FormField
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoComplete="family-name"
                textContentType="familyName"
                placeholder="Doe"
              />
              {saveMessage ? (
                <Text
                  className={
                    saveMessage.tone === 'success'
                      ? 'text-sm text-success'
                      : 'text-sm text-danger-text dark:text-danger-text-dark'
                  }>
                  {saveMessage.text}
                </Text>
              ) : null}
              <PrimaryButton
                title="Save name"
                onPress={onSaveName}
                loading={saving}
                disabled={!nameChanged}
              />
            </View>

            <PrimaryButton
              title="Sign out"
              onPress={onSignOut}
              loading={signingOut}
              variant="outline"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
