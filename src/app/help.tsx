import { Linking } from 'react-native';

import { InfoPage, InfoSection, InfoText } from '@/components/info-page';
import { PrimaryButton } from '@/components/primary-button';
import { APP_NAME, SUPPORT_EMAIL } from '@/constants/brand';

const FAQS: readonly { question: string; answer: string }[] = [
  {
    question: 'How do I contact an agent?',
    answer:
      'Open a listing and tap “Message agent”. Your conversations are in the Messages tab. You can also call or email agents who have shared their details.',
  },
  {
    question: 'How is a deal closed?',
    answer:
      'Tap “Make an offer” (or “Apply to rent”) on a listing. The agent can accept, counter or decline, and you can counter back. Once an offer is accepted the listing goes “Under offer” and you complete the real-world steps (viewing, token money, agreement, payment). When the handover is done, both of you tap “Mark as completed” — then the listing is marked sold or rented. Every step is in Profile → My deals.',
  },
  {
    question: 'When can I leave a review?',
    answer:
      'After both sides confirm a deal is completed, you can rate and review the property from the deal screen. Reviews come only from completed deals, so they reflect real experiences.',
  },
  {
    question: 'I’m renting — what about police verification?',
    answer:
      'Pakistani law requires tenants to be registered with the local police. After a rental deal is completed, MyBasera shows the official tenant-registration link for your province.',
  },
  {
    question: 'How do I list my property?',
    answer: 'Go to Profile → “List a property”, add a photo and the details, and publish.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Go to Profile → “Delete account”. This removes your listings, favorites and profile and can’t be undone.',
  },
];

export default function HelpScreen() {
  const emailSupport = () =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} support`)}`);

  return (
    <InfoPage>
      {FAQS.map((faq) => (
        <InfoSection key={faq.question} title={faq.question}>
          <InfoText>{faq.answer}</InfoText>
        </InfoSection>
      ))}

      <InfoSection title="Still need help?">
        <InfoText>Email us at {SUPPORT_EMAIL} and we’ll get back to you.</InfoText>
      </InfoSection>
      <PrimaryButton title="Contact support" onPress={emailSupport} />
    </InfoPage>
  );
}
