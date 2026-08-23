import { selectionAsync } from 'expo-haptics';
import { Platform } from 'react-native';

const HAS_HAPTICS = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Plays the platform's selection tick: the feedback for a choice landing,
 * not for a warning or a success.
 *
 * Does nothing on web, which has no haptics API, and swallows the rejection
 * a device without a haptics engine answers with. Feedback the user cannot
 * feel is never worth a failure.
 */
export function selectionTick(): void {
  if (!HAS_HAPTICS) return;

  selectionAsync().catch(() => undefined);
}
