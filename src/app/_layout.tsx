import {
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AccountProvider } from '@/lib/account-context';
import { ProgressProvider, useProgress } from '@/lib/progress-context';
import { C } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { ready } = useProgress();
  // Brand fonts (docs/BRAND.md). If they fail to load, the app still starts with system fonts.
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_400Regular_Italic,
    Poppins_500Medium,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold,
    NotoSansJP_700Bold: require('@/assets/fonts/NotoSansJP-Bold.ttf'),
  });
  const show = ready && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (show) void SplashScreen.hideAsync();
  }, [show]);

  if (!show) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.cream } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="lesson/[id]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="write/[char]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="plus" options={{ presentation: 'modal' }} />
      <Stack.Screen name="legal/[doc]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="account" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
      <Stack.Screen name="flashcards" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ProgressProvider>
      <AccountProvider>
        <StatusBar style="auto" />
        <RootStack />
      </AccountProvider>
    </ProgressProvider>
  );
}
