import { useClerk, useUser } from '@clerk/clerk-expo';
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
    <View className="flex-1 items-center justify-center gap-6 bg-white px-6 dark:bg-black">
      <View className="items-center gap-1">
        <Text className="text-2xl font-bold text-black dark:text-white">Profile</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>
      <View className="w-full">
        <PrimaryButton title="Sign out" onPress={onSignOut} loading={signingOut} />
      </View>
    </View>
  );
}
