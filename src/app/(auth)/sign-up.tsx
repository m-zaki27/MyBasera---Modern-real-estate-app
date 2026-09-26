import { useSignUp } from '@clerk/expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScreenLayout } from '@/components/auth-screen-layout';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { getClerkErrorMessage } from '@/lib/clerk-errors';

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = fetchStatus === 'fetching';

  // The root layout's Stack.Protected guard moves the user into (tabs) once the session is active.
  const finalize = async () => {
    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) setError(getClerkErrorMessage(finalizeError));
  };

  const onSignUp = async () => {
    setError(null);
    const { error: passwordError } = await signUp.password({
      emailAddress: email.trim(),
      password,
    });
    if (passwordError) {
      setError(getClerkErrorMessage(passwordError));
      return;
    }

    // Email verification is off in the Clerk instance: the account is ready now.
    if (signUp.status === 'complete') {
      await finalize();
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setError(getClerkErrorMessage(sendError));
      return;
    }
    setPendingVerification(true);
  };

  const onVerify = async () => {
    setError(null);
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (verifyError) {
      setError(getClerkErrorMessage(verifyError));
      return;
    }
    if (signUp.status === 'complete') {
      await finalize();
      return;
    }
    setError(`Sign-up incomplete — missing: ${signUp.missingFields.join(', ') || signUp.status}.`);
  };

  if (pendingVerification) {
    return (
      <AuthScreenLayout
        title="Verify your email"
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
        <PrimaryButton title="Verify" onPress={onVerify} loading={loading} disabled={!code} />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Create an account"
      subtitle="Save favorites and contact agents."
      error={error}>
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
          autoComplete="new-password"
          textContentType="newPassword"
          placeholder="At least 8 characters"
        />
      </View>
      {/* Required by Clerk's bot protection on web; renders nothing on native. */}
      <View nativeID="clerk-captcha" />
      <PrimaryButton
        title="Sign up"
        onPress={onSignUp}
        loading={loading}
        disabled={!email || !password}
      />
      <View className="flex-row justify-center gap-1">
        <Text className="text-muted dark:text-muted-dark">Already have an account?</Text>
        <Link href="/sign-in" replace>
          <Text className="font-semibold text-primary">Sign in</Text>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
