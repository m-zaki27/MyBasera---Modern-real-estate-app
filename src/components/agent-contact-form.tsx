import { useAuth } from '@clerk/expo';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

type AgentContact = {
  id: string;
  email: string | null;
  phone: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

/**
 * Opt-in public contact details for the user's agent profile (shown on their listings).
 * Only rendered once the user has an agent profile, i.e. after their first listing.
 */
export function AgentContactForm() {
  const { userId } = useAuth();
  const [agent, setAgent] = useState<AgentContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('agents')
      .select('id, email, phone')
      .eq('clerk_user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setAgent(data);
        setEmail(data?.email ?? '');
        setPhone(data?.phone ?? '');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <ActivityIndicator color={colors.primary.DEFAULT} />;
  if (!agent) return null;

  const onSave = async () => {
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
      setMessage({ tone: 'error', text: 'Enter a valid email, or leave it empty.' });
      return;
    }
    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      setMessage({ tone: 'error', text: 'Enter a valid phone number (e.g. +92 300 0000001), or leave it empty.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from('agents')
      .update({ email: trimmedEmail || null, phone: trimmedPhone || null })
      .eq('id', agent.id);
    setSaving(false);
    setMessage(
      error ? { tone: 'error', text: error.message } : { tone: 'success', text: 'Contact details saved.' }
    );
  };

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
          Contact details on your listings
        </Text>
        <Text className="text-sm text-muted dark:text-muted-dark">
          Optional. Signed-in users can see these on your listings and agent page to call or email
          you. Leave empty to be reachable only through in-app chat.
        </Text>
      </View>
      <FormField
        label="Public email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <FormField
        label="Public phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="+92 300 0000001"
      />
      {message ? (
        <Text
          className={
            message.tone === 'success' ? 'text-sm text-success' : 'text-sm text-danger-text dark:text-danger-text-dark'
          }>
          {message.text}
        </Text>
      ) : null}
      <PrimaryButton title="Save contact details" variant="outline" onPress={onSave} loading={saving} />
    </View>
  );
}
