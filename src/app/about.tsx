import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { InfoPage, InfoSection, InfoText } from '@/components/info-page';
import { APP_NAME, APP_TAGLINE } from '@/constants/brand';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <InfoPage>
      <View className="items-center gap-3 pt-2">
        <Image
          source={require('@/assets/images/logo.png')}
          className="h-24 w-24"
          contentFit="contain"
          accessibilityLabel={`${APP_NAME} logo`}
        />
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">{APP_NAME}</Text>
        <Text className="text-center text-sm text-muted dark:text-muted-dark">{APP_TAGLINE}</Text>
        <Text className="text-xs text-muted dark:text-muted-dark">Version {version}</Text>
      </View>

      <InfoSection title="What is MyBasera?">
        <InfoText>
          “Basera” means a home or shelter. MyBasera helps you find houses and apartments to
          buy or rent across Pakistan, talk to agents directly in the app, and close deals with a
          clear, confirmed record on both sides.
        </InfoText>
      </InfoSection>

      <InfoSection title="How it works">
        <InfoText>
          1. Browse and filter listings, or explore them on the map.{'\n'}
          2. Message the agent, then make an offer — or apply to rent.{'\n'}
          3. Negotiate: either side can accept, counter or decline.{'\n'}
          4. Once accepted, the listing is “Under offer” while you finish the paperwork and
          payment.{'\n'}
          5. Both sides mark the deal completed — it’s then sold or rented.{'\n'}
          6. Leave a review. For rentals, register the tenancy with the police using the official link
          we show.
        </InfoText>
      </InfoSection>

      <InfoSection title="For agents and owners">
        <InfoText>
          Anyone can list a property from their profile. Your listings, chats and deals all stay
          in one place.
        </InfoText>
      </InfoSection>
    </InfoPage>
  );
}
