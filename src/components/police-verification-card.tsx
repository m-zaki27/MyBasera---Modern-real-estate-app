import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { POLICE_REGIONS, policeRegionForAddress, type PoliceRegion } from '@/constants/police-verification';

type PoliceVerificationCardProps = {
  /** The rented property's address, used to suggest the right province. */
  address: string;
};

type RegionLinkProps = {
  region: PoliceRegion;
  primary?: boolean;
};

function RegionLink({ region, primary = false }: RegionLinkProps) {
  return (
    <Pressable
      onPress={() => Linking.openURL(region.url)}
      accessibilityRole="link"
      accessibilityLabel={`${region.service}, opens the official website`}
      className={`flex-row items-center gap-3 rounded-field px-4 py-3 active:opacity-80 ${
        primary ? 'bg-primary' : 'border border-border dark:border-border-dark'
      }`}>
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${primary ? 'text-white' : 'text-foreground dark:text-foreground-dark'}`}>
          {region.name}
        </Text>
        <Text className={`text-xs ${primary ? 'text-white' : 'text-muted dark:text-muted-dark'}`}>
          {region.service}
        </Text>
      </View>
      <SymbolView
        name={{ ios: 'arrow.up.right.square', android: 'open_in_new', web: 'open_in_new' }}
        tintColor={primary ? colors.white : colors.muted.DEFAULT}
        size={16}
      />
    </Pressable>
  );
}

/**
 * After a rental deal: points tenants and landlords to the official police tenant-registration
 * service, required by provincial law in Pakistan.
 */
export function PoliceVerificationCard({ address }: PoliceVerificationCardProps) {
  const suggested = policeRegionForAddress(address);
  const others = POLICE_REGIONS.filter((region) => region.key !== suggested?.key);

  return (
    <View className="gap-3 rounded-card border border-border p-4 dark:border-border-dark">
      <View className="flex-row items-center gap-2">
        <SymbolView
          name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }}
          tintColor={colors.primary.DEFAULT}
          size={20}
        />
        <Text className="flex-1 text-base font-bold text-foreground dark:text-foreground-dark">
          Register the tenancy with the police
        </Text>
      </View>
      <Text className="text-sm leading-5 text-muted dark:text-muted-dark">
        Pakistani law requires every tenancy to be registered with the local police. It’s free —
        have both CNICs, the rent agreement and a tenant photo ready. You can also register at the
        nearest police station or Khidmat Markaz.
      </Text>
      {suggested ? <RegionLink region={suggested} primary /> : null}
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
        {suggested ? 'Other provinces' : 'Choose your province'}
      </Text>
      {others.map((region) => (
        <RegionLink key={region.key} region={region} />
      ))}
    </View>
  );
}
