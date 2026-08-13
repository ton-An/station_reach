import { useMemo } from 'react';
import { Gesture, type ManualGesture } from 'react-native-gesture-handler';

/** How far a finger may slide and still have meant to tap, in points. */
const TAP_SLOP = 12;

/**
 * Builds a tap gesture that reads the raw touch stream.
 *
 * ! Deliberately not a `Gesture.Tap`. A tap gesture has to *win* recognition,
 * and over this map it cannot win quickly: the binding wires its own tap to
 * fail-wait on the map's double-tap and two-finger-tap recognisers, and UIKit
 * lets only one recogniser tracking a touch come out on top — so a competing
 * tap either loses outright or is a third of a second late. `Gesture.Manual`
 * with only `onTouches*` handlers sidesteps the arbitration entirely: the
 * callbacks run off the raw touches, so this resolves on touch-up while the
 * map's own tap is still waiting to see whether a second one arrives.
 * Recognising nothing is also what leaves panning, pinching and
 * double-tap-to-zoom untouched — this gesture never activates.
 *
 * Which means the slop and multi-touch checks are ours to make: without them,
 * lifting a finger at the end of a pan would read as a tap.
 *
 * @param onTap - Called on touch-up with the touch position, in view points.
 * @returns A gesture to wrap around the map.
 */
function createMapTapGesture(
  onTap: (x: number, y: number) => void
): ManualGesture {
  // Where the tracked touch went down, or undefined once it has been ruled out
  // as a tap: a second finger, a drag, or a cancel.
  let origin: { x: number; y: number } | undefined;

  return Gesture.Manual()
    .runOnJS(true)
    .onTouchesDown((event) => {
      const touch = event.changedTouches[0];

      origin =
        event.numberOfTouches > 1 || touch === undefined
          ? undefined
          : { x: touch.x, y: touch.y };
    })
    .onTouchesMove((event) => {
      const touch = event.changedTouches[0];
      if (origin === undefined || touch === undefined) return;

      if (
        Math.abs(touch.x - origin.x) > TAP_SLOP ||
        Math.abs(touch.y - origin.y) > TAP_SLOP
      ) {
        origin = undefined;
      }
    })
    .onTouchesUp((event) => {
      const start = origin;
      origin = undefined;

      const touch = event.changedTouches[0];
      if (start === undefined || touch === undefined) return;

      onTap(touch.x, touch.y);
    })
    .onTouchesCancelled(() => {
      origin = undefined;
    });
}

/**
 * The map's tap gesture, built once.
 *
 * @param onTap - Called on touch-up with the touch position, in view points.
 *   Has to be referentially stable, or the gesture is rebuilt on every render.
 * @returns A gesture to wrap around the map — see {@link createMapTapGesture}.
 */
export function useMapTapGesture(
  onTap: (x: number, y: number) => void
): ManualGesture {
  return useMemo(() => createMapTapGesture(onTap), [onTap]);
}
