import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { formatArea } from '@/lib/format';

type SpecProps = {
  icon: SymbolViewProps['name'];
  label: string;
};

function Spec({ icon, label }: SpecProps) {
  return (
    <View className="flex-row items-center gap-1">
      <SymbolView name={icon} tintColor={colors.muted.DEFAULT} size={14} />
      <Text className="text-sm text-muted dark:text-muted-dark">{label}</Text>
    </View>
  );
}

type PropertySpecsProps = {
  bedrooms: number;
  bathrooms: number;
  area: number | null;
};

export function PropertySpecs({ bedrooms, bathrooms, area }: PropertySpecsProps) {
  return (
    <View className="flex-row flex-wrap gap-4">
      <Spec
        icon={{ ios: 'bed.double.fill', android: 'bed', web: 'bed' }}
        label={bedrooms === 0 ? 'Studio' : `${bedrooms} bd`}
      />
      <Spec
        icon={{ ios: 'shower.fill', android: 'bathtub', web: 'bathtub' }}
        label={`${bathrooms} ba`}
      />
      {area ? (
        <Spec
          icon={{ ios: 'square.dashed', android: 'square_foot', web: 'square_foot' }}
          label={formatArea(area)}
        />
      ) : null}
    </View>
  );
}
