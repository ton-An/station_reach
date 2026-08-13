import { createContext, useContext } from 'react';
import { withTiming, type SharedValue } from 'react-native-reanimated';

export const SMALL_HEIGHT = 0.3;
export const MEDIUM_HEIGHT = 0.6;
export const LARGE_HEIGHT = 1;

const SIGNIFICANT_DRAG = 70;

export const DRAG_ACTIVATION_SLOP = 2;

export interface SheetDrag {
  readonly fraction: SharedValue<number>;
  readonly availableHeight: SharedValue<number>;
  readonly dragStartFraction: SharedValue<number>;
  readonly snapDuration: number;
}

const SheetDragContext = createContext<SheetDrag | undefined>(undefined);

export const SheetDragProvider = SheetDragContext.Provider;

export function useSheetDrag(): SheetDrag {
  const drag = useContext(SheetDragContext);

  if (drag === undefined) {
    throw new Error('useSheetDrag must be used inside a DraggableModal.');
  }

  return drag;
}

export function beginSheetDrag(drag: SheetDrag): void {
  'worklet';
  drag.dragStartFraction.value = drag.fraction.value;
}

export function updateSheetDrag(drag: SheetDrag, translationY: number): void {
  'worklet';
  if (drag.availableHeight.value === 0) return;

  const next =
    drag.dragStartFraction.value - translationY / drag.availableHeight.value;

  drag.fraction.value = Math.min(Math.max(next, SMALL_HEIGHT), LARGE_HEIGHT);
}

export function endSheetDrag(drag: SheetDrag, translationY: number): void {
  'worklet';
  const draggedUp = translationY < 0;
  const isSignificant = Math.abs(translationY) > SIGNIFICANT_DRAG;
  const goUp = isSignificant ? draggedUp : !draggedUp;

  drag.fraction.value = withTiming(goUp ? LARGE_HEIGHT : SMALL_HEIGHT, {
    duration: drag.snapDuration,
  });
}
