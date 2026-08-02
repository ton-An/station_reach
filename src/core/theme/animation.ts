import { Platform } from 'react-native';

/**
 * Whether animations can run off the JS thread.
 *
 * React Native Web has no native animation module, so driving an animation
 * natively there warns and falls back anyway.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';
