import { isClerkAPIResponseError } from '@clerk/expo';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getClerkErrorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const [first] = error.errors;
    return first?.longMessage ?? first?.message ?? FALLBACK_MESSAGE;
  }
  if (error instanceof Error) {
    // Other ClerkErrors carry a user-facing longMessage alongside a prefixed message.
    const { longMessage } = error as Error & { longMessage?: string };
    return longMessage ?? error.message;
  }
  return FALLBACK_MESSAGE;
}
