const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to .env.local (see Clerk Dashboard → API Keys) and restart the dev server with `npx expo start --clear`.'
  );
}

export const clerkPublishableKey: string = publishableKey;
