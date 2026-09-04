import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '@intentional/ui';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.copperDeep,
        tabBarInactiveTintColor: colors.stone,
        tabBarStyle: {
          backgroundColor: colors.cream, borderTopColor: colors.hairline,
          height: 64 + insets.bottom, paddingBottom: insets.bottom + 10, paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: typography.families.bodyMedium, fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} /> }} />
      <Tabs.Screen name="focus" options={{ title: 'Focus', tabBarIcon: ({ color, size }) => <Feather name="target" size={size} color={color} /> }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal', tabBarIcon: ({ color, size }) => <Feather name="edit-3" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <Feather name="more-horizontal" size={size} color={color} /> }} />
    </Tabs>
  );
}
