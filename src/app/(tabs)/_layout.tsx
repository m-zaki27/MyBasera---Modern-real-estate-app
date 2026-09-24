import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type TabIconProps = {
  name: SymbolViewProps['name'];
  color: ColorValue;
};

function TabIcon({ name, color }: TabIconProps) {
  return <SymbolView name={name} tintColor={color} size={24} />;
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
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
