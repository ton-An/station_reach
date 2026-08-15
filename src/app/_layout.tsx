import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { InAppNotificationListener } from '@/core/components/in-app-notification';
import { ContainerProvider } from '@/core/container';
import { FONT_FAMILY } from '@/core/theme/theme';

/**
 * Root layout mounted for every route.
 *
 * Renders nothing until the {@link FONT_FAMILY} font has loaded. Mounts
 * {@link InAppNotificationListener} once here, above the `Stack`, so it is
 * the one place a failure reaches the screen from any route.
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

          <Stack screenOptions={{ headerShown: false }} />

          <InAppNotificationListener />
        </SafeAreaProvider>
      </ContainerProvider>
    </GestureHandlerRootView>
  );
}
