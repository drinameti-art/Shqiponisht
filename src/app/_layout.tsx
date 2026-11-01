// Per-weight imports, so only the seven weights the app uses are bundled.
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_400Regular_Italic } from '@expo-google-fonts/poppins/400Regular_Italic';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_500Medium_Italic } from '@expo-google-fonts/poppins/500Medium_Italic';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_600SemiBold_Italic } from '@expo-google-fonts/poppins/600SemiBold_Italic';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { LogoIntro } from '@/components/logo-intro';
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

/** The logo intro plays over the first screen once fonts and progress are loaded (the splash is plain cream). */
function IntroWhenReady() {
  const { ready } = useProgress();
  return ready ? <LogoIntro /> : null;
}

export default function RootLayout() {
  return (
    <ProgressProvider>
      <AccountProvider>
        <StatusBar style="auto" />
        <RootStack />
        <IntroWhenReady />
      </AccountProvider>
    </ProgressProvider>
  );
}
