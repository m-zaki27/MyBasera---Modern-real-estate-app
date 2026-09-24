import { Stack } from 'expo-router';

// Signed-out users are redirected into this group by the root layout's guard;
// make sure they land on sign-in rather than sign-up.
export const unstable_settings = {
  initialRouteName: 'sign-in',
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
