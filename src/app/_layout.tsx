import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { InAppNotificationListener } from '@/core/components/in-app-notification';
import { ContainerProvider } from '@/core/container';
import { FONT_FAMILY } from '@/core/theme/theme';

/**
 * The app shell.
 *
 * Nothing renders until Inter is available: the fallback is a serif face, and
 * swapping it in after first paint reflows every label on the map.
 *
 * The container is provided above everything, so every store the app uses is
 * resolved from the tree rather than imported. The notification listener sits
 * above the navigator so a failure raised on any screen surfaces in the same
 * place.
 */
export default function RootLayout() {
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
