import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, typography } from '@intentional/ui';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.copperDeep,
        tabBarInactiveTintColor: colors.stone,
        tabBarStyle: { backgroundColor: colors.cream, borderTopColor: colors.hairline, height: 86, paddingBottom: 30, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: typography.families.bodyMedium, fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} /> }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal', tabBarIcon: ({ color, size }) => <Feather name="edit-3" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <Feather name="more-horizontal" size={size} color={color} /> }} />
    </Tabs>
  );
}
