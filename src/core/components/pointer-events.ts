import { StyleSheet } from 'react-native';

/**
 * Pointer event style for pass-through containers.
 *
 * {@link box-none} allows touch events to pass through to child elements.
 * This differs from {@link none}, which blocks all events on the view.
 */
export const pointerEvents = StyleSheet.create({
  passThrough: { pointerEvents: 'box-none' },
});
