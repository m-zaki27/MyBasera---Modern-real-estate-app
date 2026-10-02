import { useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { AgentContactForm } from '@/components/agent-contact-form';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { ProfileAvatar } from '@/components/profile-avatar';
import { getClerkErrorMessage } from '@/lib/clerk-errors';
import { syncAgentProfile } from '@/lib/profile-sync';

export default function EditProfileScreen() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const nameChanged =
    firstName.trim() !== (user.firstName ?? '') || lastName.trim() !== (user.lastName ?? '');

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      if (updated.fullName) await syncAgentProfile(user.id, { name: updated.fullName });
      router.back();
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-6 px-screen py-6" keyboardShouldPersistTaps="handled">
          <View className="items-center gap-2">
            <ProfileAvatar />
            <Text className="text-sm text-muted dark:text-muted-dark">Tap the photo to change it</Text>
          </View>
          <FormField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoComplete="given-name"
            textContentType="givenName"
            placeholder="Ayesha"
          />
          <FormField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoComplete="family-name"
            textContentType="familyName"
            placeholder="Khan"
          />
          <Text className="text-xs text-muted dark:text-muted-dark">
            Your name and photo also appear on listings you post.
          </Text>
          {error ? (
            <Text className="text-sm text-danger-text dark:text-danger-text-dark">{error}</Text>
          ) : null}
          <PrimaryButton title="Save" onPress={onSave} loading={saving} disabled={!nameChanged} />

          <View className="h-px bg-border dark:bg-border-dark" />
          <AgentContactForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
