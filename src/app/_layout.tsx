import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ProgressProvider, useProgress } from '@/lib/progress-context';
import { C } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { ready } = useProgress();

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.cream } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="lesson/[id]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="write/[char]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="plus" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ProgressProvider>
      <StatusBar style="dark" />
      <RootStack />
    </ProgressProvider>
  );
}
