import { Platform } from 'react-native';

/**
 * Whether {@link Animated} may drive an animation on the native thread.
 * Every animation call site reads this instead of hardcoding
 * `useNativeDriver: true`, which does not hold on web.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';
