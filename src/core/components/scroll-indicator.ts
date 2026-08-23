import { Platform } from 'react-native';

/**
 * Whether a scrollable surface should draw its scroll indicator.
 *
 * A desktop browser draws a full-width scrollbar that sits on a surface's
 * rounded corner and never fades. Every other platform overlays a thin
 * indicator that does fade, which the surfaces keep.
 */
export const SHOWS_SCROLL_INDICATOR = Platform.OS !== 'web';
