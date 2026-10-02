import { InfoPage, InfoSection, InfoText } from '@/components/info-page';
import { LegalDraftNotice } from '@/components/legal-draft-notice';
import { SUPPORT_EMAIL } from '@/constants/brand';

export default function TermsScreen() {
  return (
    <InfoPage>
      <LegalDraftNotice />

      <InfoSection title="Using MyBasera">
        <InfoText>
          MyBasera is a platform that connects people looking to buy or rent property with agents
          and owners. MyBasera is not a party to any sale or tenancy and doesn’t own, inspect or
          guarantee the properties listed.
        </InfoText>
      </InfoSection>

      <InfoSection title="Listings">
        <InfoText>
          If you post a listing, you confirm you’re authorised to offer the property and that its
          details, price and photos are accurate. We may remove listings that are misleading,
          duplicated or unlawful.
        </InfoText>
      </InfoSection>

      <InfoSection title="Deals and payments">
        <InfoText>
          Deals recorded in the app are a confirmation between the two parties of the agreed terms.
          They are not a legal sale deed or tenancy agreement. Complete transfers, agreements and
          payments through the proper legal channels.
        </InfoText>
      </InfoSection>

      <InfoSection title="Rentals and police verification">
        <InfoText>
          Landlords and tenants are responsible for registering tenancies with the local police as
          required by provincial law. The links we show are provided for convenience.
        </InfoText>
      </InfoSection>

      <InfoSection title="Conduct">
        <InfoText>
          Be respectful in messages and reviews. Don’t post fake reviews, spam, or anyone else’s
          personal information.
        </InfoText>
      </InfoSection>

      <InfoSection title="Contact">
        <InfoText>{SUPPORT_EMAIL}</InfoText>
      </InfoSection>
    </InfoPage>
  );
}
