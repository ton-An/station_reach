import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HydrationGate } from '@/core/components/hydration-gate';
import { InAppNotifications } from '@/core/components/in-app-notification';
import { ContainerProvider } from '@/core/container';
import { FONT_FAMILY } from '@/core/theme/theme';

/**
 * Root layout mounted for every route.
 *
 * Renders nothing until the {@link FONT_FAMILY} font has loaded. Mounts
 * {@link InAppNotifications} once here, above the `Stack`, so it is
 * the one place a failure reaches the screen from any route.
 * {@link HydrationGate} holds the web build's first paint.
 */
export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts({
    [FONT_FAMILY]: require('@/assets/fonts/Inter.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContainerProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />

          <HydrationGate>
            <Stack screenOptions={{ headerShown: false }} />

            <InAppNotifications />
          </HydrationGate>
        </SafeAreaProvider>
      </ContainerProvider>
    </GestureHandlerRootView>
  );
}
