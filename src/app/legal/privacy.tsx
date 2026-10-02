import { InfoPage, InfoSection, InfoText } from '@/components/info-page';
import { LegalDraftNotice } from '@/components/legal-draft-notice';
import { SUPPORT_EMAIL } from '@/constants/brand';

export default function PrivacyPolicyScreen() {
  return (
    <InfoPage>
      <LegalDraftNotice />

      <InfoSection title="What we collect">
        <InfoText>
          Account details you give us (name, email, profile photo), listings you post (including
          photos and addresses), messages you send to other users, deals you propose or confirm,
          reviews, and your saved favorites.
        </InfoText>
      </InfoSection>

      <InfoSection title="How we use it">
        <InfoText>
          To run the app: show listings, connect buyers and tenants with agents, record deals,
          display reviews, and keep your account secure. We don’t sell your personal data.
        </InfoText>
      </InfoSection>

      <InfoSection title="Who can see what">
        <InfoText>
          Listings, agent profiles and reviews are public. Messages are visible only to the two
          people in the conversation. Favorites and deals are visible only to the people involved.
        </InfoText>
      </InfoSection>

      <InfoSection title="Service providers">
        <InfoText>
          Sign-in is handled by Clerk, and app data and photos are stored with Supabase. These
          providers process data on our behalf under their own security and privacy terms.
        </InfoText>
      </InfoSection>

      <InfoSection title="Your choices">
        <InfoText>
          You can edit your profile, delete your listings, and delete your account at any time from
          the Profile tab. Deleting your account removes your profile, listings and favorites.
        </InfoText>
      </InfoSection>

      <InfoSection title="Contact">
        <InfoText>Questions about privacy: {SUPPORT_EMAIL}</InfoText>
      </InfoSection>
    </InfoPage>
  );
}
