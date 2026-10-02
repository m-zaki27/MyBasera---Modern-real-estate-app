import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useColorScheme, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

type TabIconProps = {
  name: SymbolViewProps['name'];
  color: ColorValue;
};

function TabIcon({ name, color }: TabIconProps) {
  return <SymbolView name={name} tintColor={color} size={24} />;
}

export default function TabLayout() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? colors.primary[300] : colors.primary.DEFAULT,
        tabBarInactiveTintColor: isDark ? colors.muted.dark : colors.muted.DEFAULT,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.DEFAULT,
          borderTopColor: isDark ? colors.border.dark : colors.border.DEFAULT,
          height: 64 + insets.bottom,
          paddingTop: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'house.fill', android: 'home', web: 'home' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <TabIcon
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => (
            <TabIcon
              name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <TabIcon
              name={{ ios: 'bubble.left.and.bubble.right.fill', android: 'chat', web: 'chat' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'person.fill', android: 'person', web: 'person' }} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
