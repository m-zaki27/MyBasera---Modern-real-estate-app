import { useClerk, useUser } from '@clerk/expo';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

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
    <View className="flex-1 items-center justify-center gap-6 bg-background px-6 dark:bg-background-dark">
      <View className="items-center gap-1">
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">Profile</Text>
        <Text className="text-base text-muted dark:text-muted-dark">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>
      <View className="w-full">
        <PrimaryButton title="Sign out" onPress={onSignOut} loading={signingOut} />
      </View>
    </View>
  );
}
