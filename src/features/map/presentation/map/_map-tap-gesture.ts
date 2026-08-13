import { useMemo } from 'react';
import { Gesture, type ManualGesture } from 'react-native-gesture-handler';

const TAP_SLOP = 12;

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

export function useMapTapGesture(
  onTap: (x: number, y: number) => void
): ManualGesture {
  return useMemo(() => createMapTapGesture(onTap), [onTap]);
}
