import { useSignIn } from '@clerk/expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScreenLayout } from '@/components/auth-screen-layout';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { getClerkErrorMessage } from '@/lib/clerk-errors';

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsEmailCode, setNeedsEmailCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = fetchStatus === 'fetching';

  // The root layout's Stack.Protected guard moves the user into (tabs) once the session is active.
  const finalize = async () => {
    const { error: finalizeError } = await signIn.finalize();
    if (finalizeError) setError(getClerkErrorMessage(finalizeError));
  };

  const onSignIn = async () => {
    setError(null);
    const { error: passwordError } = await signIn.password({ identifier: email.trim(), password });
    if (passwordError) {
      setError(getClerkErrorMessage(passwordError));
      return;
    }

    if (signIn.status === 'complete') {
      await finalize();
      return;
    }

    // Clerk asks for an emailed code on new devices (Device Trust) or when email MFA is on.
    const canUseEmailCode =
      signIn.status === 'needs_client_trust' ||
      (signIn.status === 'needs_second_factor' &&
        signIn.supportedSecondFactors.some((factor) => factor.strategy === 'email_code'));
    if (canUseEmailCode) {
      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) {
        setError(getClerkErrorMessage(sendError));
        return;
      }
      setNeedsEmailCode(true);
      return;
    }

    setError(`Sign-in needs another step this app doesn't support yet (${signIn.status}).`);
  };

  const onVerifyCode = async () => {
    setError(null);
    const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (verifyError) {
      setError(getClerkErrorMessage(verifyError));
      return;
    }
    if (signIn.status === 'complete') {
      await finalize();
      return;
    }
    setError(`Verification incomplete (${signIn.status}).`);
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
        disabled={!email || !password}
      />
      <View className="flex-row justify-center gap-1">
        <Text className="text-muted dark:text-muted-dark">Don&apos;t have an account?</Text>
        <Link href="/sign-up" replace>
          <Text className="font-semibold text-primary dark:text-primary-300">Sign up</Text>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
