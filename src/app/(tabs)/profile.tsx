import { useClerk, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ProfileAvatar } from '@/components/profile-avatar';
import { SegmentedControl } from '@/components/segmented-control';
import { SettingsRow, SettingsSection } from '@/components/settings-row';
import { useMyListings } from '@/hooks/use-my-listings';
import { deleteAccount } from '@/lib/account';
import { confirmAction, showAlert } from '@/lib/alert';
import {
  applyAppearance,
  canChangeAppearance,
  loadAppearance,
  type AppearancePreference,
} from '@/lib/appearance';
import { getClerkErrorMessage } from '@/lib/clerk-errors';
import { formatDate } from '@/lib/format';
import { useFavoritesStore } from '@/store/favorites';

const APPEARANCE_OPTIONS: readonly { key: AppearancePreference; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

type StatProps = {
  value: number;
  label: string;
  onPress: () => void;
};

function Stat({ value, label, onPress }: StatProps) {
  return (
    <View className="flex-1">
      <PrimaryButton title={`${value} ${label}`} onPress={onPress} variant="outline" />
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const favoriteCount = useFavoritesStore((state) => Object.keys(state.ids).length);
  const { listings } = useMyListings();

  const [appearance, setAppearance] = useState<AppearancePreference>('system');
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAppearance().then(setAppearance);
  }, []);

  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress;

  const onAppearanceChange = (preference: AppearancePreference) => {
    setAppearance(preference);
    applyAppearance(preference);
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

  const onDeleteAccount = async () => {
    const confirmed = await confirmAction({
      title: 'Delete your account?',
      message:
        'This permanently deletes your profile, your listings and their photos, your favorites and your conversations. It can’t be undone.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteAccount(user);
      // Clerk signs the user out after deletion; the auth guard shows sign-in.
    } catch (err) {
      showAlert("Couldn't delete your account", getClerkErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* SafeAreaView isn't className-aware without a cssInterop mapping; flex is its only style. */}
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="gap-7 px-screen pb-10 pt-2">
          <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">Profile</Text>

          <View className="items-center gap-3">
            <ProfileAvatar />
            <View className="items-center gap-1">
              <Text className="text-xl font-bold text-foreground dark:text-foreground-dark">
                {user.fullName || 'Add your name'}
              </Text>
              {email ? <Text className="text-sm text-muted dark:text-muted-dark">{email}</Text> : null}
              {user.createdAt ? (
                <Text className="text-xs text-muted dark:text-muted-dark">
                  Member since {formatDate(user.createdAt.toISOString())}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row gap-3">
            <Stat value={favoriteCount} label="saved" onPress={() => router.navigate('/favorites')} />
            <Stat value={listings.length} label="listings" onPress={() => router.push('/my-listings')} />
          </View>

          <SettingsSection title="Activity">
            <SettingsRow
              icon={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }}
              label="Messages"
              onPress={() => router.navigate('/messages')}
            />
            <SettingsRow
              icon={{ ios: 'checkmark.seal', android: 'handshake', web: 'handshake' }}
              label="My deals"
              onPress={() => router.push('/deals')}
            />
          </SettingsSection>

          <SettingsSection title="Account">
            <SettingsRow
              icon={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
              label="Edit profile"
              onPress={() => router.push('/edit-profile')}
            />
            <SettingsRow
              icon={{ ios: 'house', android: 'home_work', web: 'home_work' }}
              label="My listings"
              value={String(listings.length)}
              onPress={() => router.push('/my-listings')}
            />
            <SettingsRow
              icon={{ ios: 'plus.square', android: 'add_box', web: 'add_box' }}
              label="List a property"
              onPress={() => router.push('/listing/new')}
            />
          </SettingsSection>

          {canChangeAppearance ? (
            <View className="gap-2">
              <Text className="px-1 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                Appearance
              </Text>
              <SegmentedControl
                options={APPEARANCE_OPTIONS}
                selected={appearance}
                onSelect={onAppearanceChange}
              />
            </View>
          ) : null}

          <SettingsSection title="Support">
            <SettingsRow
              icon={{ ios: 'questionmark.circle', android: 'help', web: 'help' }}
              label="Help & support"
              onPress={() => router.push('/help')}
            />
            <SettingsRow
              icon={{ ios: 'info.circle', android: 'info', web: 'info' }}
              label="About MyBasera"
              onPress={() => router.push('/about')}
            />
            <SettingsRow
              icon={{ ios: 'lock.shield', android: 'privacy_tip', web: 'privacy_tip' }}
              label="Privacy policy"
              onPress={() => router.push('/legal/privacy')}
            />
            <SettingsRow
              icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
              label="Terms of service"
              onPress={() => router.push('/legal/terms')}
            />
          </SettingsSection>

          <View className="gap-3">
            <PrimaryButton title="Sign out" onPress={onSignOut} loading={signingOut} variant="outline" />
            <SettingsSection title="Danger zone">
              <SettingsRow
                icon={{ ios: 'trash', android: 'delete', web: 'delete' }}
                label={deleting ? 'Deleting account…' : 'Delete account'}
                onPress={deleting ? () => undefined : onDeleteAccount}
                destructive
              />
            </SettingsSection>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
