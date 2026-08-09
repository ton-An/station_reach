import { StyleSheet } from 'react-native';

/**
 * Pointer-event styles for the chrome floating over the map.
 *
 * Every transparent container between the map and a panel has to let taps
 * through while its children still take theirs — which is exactly `box-none`,
 * and nothing else. `'none'` is not a substitute: on the web it is merely
 * inherited, so a child can override it with `'auto'`, but on a device it
 * excludes the whole subtree from hit testing and a child cannot opt back in.
 *
 * `box-none` has to come from `StyleSheet.create`. React Native Web polyfills
 * the value while compiling a *registered* style — emitting the paired
 * `.container > * { pointer-events: auto }` rule the value implies — and drops
 * it when the same value arrives in an inline object, since no such CSS value
 * exists. Passing {@link passThrough} through works on both.
 */
export const pointerEvents = StyleSheet.create({
  /** Falls through to the map; direct children are hit-tested normally. */
  passThrough: { pointerEvents: 'box-none' },
});
