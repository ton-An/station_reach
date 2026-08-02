import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { InAppNotificationListener } from '@/core/components/in-app-notification';

/**
 * The app shell.
 *
 * The notification listener sits above the navigator so a failure raised on any
 * screen surfaces in the same place.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />

        <Stack screenOptions={{ headerShown: false }} />

        <InAppNotificationListener />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
