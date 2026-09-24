import { useSignUp } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScreenLayout } from '@/components/auth-screen-layout';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { getClerkErrorMessage } from '@/lib/clerk-errors';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const attempt = await signUp.create({ emailAddress: email.trim(), password });

      // Email verification is off in the Clerk instance: the account is ready now.
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status === 'complete') {
        // The root layout's Stack.Protected guard moves the user into (tabs).
        await setActive({ session: attempt.createdSessionId });
        return;
      }
      setError(`Sign-up incomplete — missing: ${attempt.missingFields.join(', ') || attempt.status}.`);
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
        disabled={!isLoaded || !email || !password}
      />
      <View className="flex-row justify-center gap-1">
        <Text className="text-neutral-500 dark:text-neutral-400">Already have an account?</Text>
        <Link href="/sign-in" replace>
          <Text className="font-semibold text-blue-600">Sign in</Text>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
