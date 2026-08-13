import { useMemo } from 'react';
import { Gesture, type ManualGesture } from 'react-native-gesture-handler';

const TAP_SLOP = 12;

/**
 * Builds a tap gesture that reads the raw touch stream.
 *
 * A `Gesture.Tap` has to win recognition against the map's own double-tap
 * handler, which costs a third of a second. `Gesture.Manual` with only
 * `onTouches*` handlers never activates, so it resolves on touch-up and
 * leaves panning, pinching and double-tap-to-zoom alone. The slop and
 * multi-touch checks below are therefore this gesture's own.
 */
function createMapTapGesture(
  onTap: (x: number, y: number) => void
): ManualGesture {
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
 * Hook that memoizes a manual tap gesture for the map.
 *
 * @param onTap - Callback invoked with screen coordinates of the tap.
 * @returns A memoized {@link ManualGesture} that fires onTap on valid taps.
 */
export function useMapTapGesture(
  onTap: (x: number, y: number) => void
): ManualGesture {
  return useMemo(() => createMapTapGesture(onTap), [onTap]);
}
