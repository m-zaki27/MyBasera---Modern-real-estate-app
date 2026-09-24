import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScreenLayout } from '@/components/auth-screen-layout';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { getClerkErrorMessage } from '@/lib/clerk-errors';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsEmailCode, setNeedsEmailCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email.trim(), password });

      if (attempt.status === 'complete') {
        // The root layout's Stack.Protected guard moves the user into (tabs).
        await setActive({ session: attempt.createdSessionId });
        return;
      }

      // Clerk can ask for an emailed code as a second factor (e.g. signing in on a new device).
      const emailCodeFactor = attempt.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code'
      );
      if (attempt.status === 'needs_second_factor' && emailCodeFactor) {
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setNeedsEmailCode(true);
        return;
      }

      setError(`Sign-in needs another step this app doesn't support yet (${attempt.status}).`);
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const attempt = await signIn.attemptSecondFactor({ strategy: 'email_code', code: code.trim() });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        return;
      }
      setError(`Verification incomplete (${attempt.status}).`);
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (needsEmailCode) {
    return (
      <AuthScreenLayout
        title="Check your email"
        subtitle={`Enter the code we sent to ${email.trim()}.`}
        error={error}>
        <FormField
          label="Verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          placeholder="123456"
        />
        <PrimaryButton title="Verify" onPress={onVerifyCode} loading={loading} disabled={!code} />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout title="Welcome back" subtitle="Sign in to find your next home." error={error}>
      <View className="gap-4">
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          placeholder="••••••••"
        />
      </View>
      <PrimaryButton
        title="Sign in"
        onPress={onSignIn}
        loading={loading}
        disabled={!isLoaded || !email || !password}
      />
      <View className="flex-row justify-center gap-1">
        <Text className="text-neutral-500 dark:text-neutral-400">Don&apos;t have an account?</Text>
        <Link href="/sign-up" replace>
          <Text className="font-semibold text-blue-600">Sign up</Text>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
