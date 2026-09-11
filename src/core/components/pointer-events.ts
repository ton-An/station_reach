import { StyleSheet } from 'react-native';

/**
 * Pass-through pointer-event styles for containers stacked over the map.
 *
 * `passThrough` lets touches fall through the container to whatever is
 * behind it, while its children stay touchable. `'none'` is not a
 * substitute: it disables the children too, not just the container.
 */
export const pointerEvents = StyleSheet.create({
  passThrough: { pointerEvents: 'box-none' },
});
