import { isClerkAPIResponseError } from '@clerk/clerk-expo';

export function getClerkErrorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const [first] = error.errors;
    return first?.longMessage ?? first?.message ?? 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
