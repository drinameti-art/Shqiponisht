import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { useProgress } from '@/lib/progress-context';
import { C } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function icon(name: IconName, active: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : name} color={String(color)} size={size} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  const { progress } = useProgress();
  if (!progress.onboarded) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.red,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: C.paper, borderTopColor: C.line },
        tabBarLabelStyle: { fontWeight: '600' },
        sceneStyle: { backgroundColor: C.cream },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Sot', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="kana" options={{ title: 'Kana', tabBarIcon: icon('grid-outline', 'grid') }} />
      <Tabs.Screen name="kanji" options={{ title: 'Kanji', tabBarIcon: icon('language-outline', 'language') }} />
      <Tabs.Screen name="fjalori" options={{ title: 'Fjalori', tabBarIcon: icon('book-outline', 'book') }} />
      <Tabs.Screen name="profili" options={{ title: 'Profili', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
