import { createContext, useContext } from 'react';
import { withTiming, type SharedValue } from 'react-native-reanimated';

export const SMALL_HEIGHT = 0.3;
export const MEDIUM_HEIGHT = 0.6;
export const LARGE_HEIGHT = 1;

const SIGNIFICANT_DRAG = 70;

export const DRAG_ACTIVATION_SLOP = 2;

/**
 * The sheet's live drag state, shared with whatever scrolls inside it.
 *
 * The shared values are read and written on the UI thread, so the sheet keeps
 * up with a finger without a round trip through JavaScript.
 */
export interface SheetDrag {
  /** How much of the available height the sheet occupies, from 0 to 1. */
  readonly fraction: SharedValue<number>;
  /** The height the sheet may grow into, measured on layout. */
  readonly availableHeight: SharedValue<number>;
  readonly dragStartFraction: SharedValue<number>;
  readonly snapDuration: number;
}

const SheetDragContext = createContext<SheetDrag | undefined>(undefined);

export const SheetDragProvider = SheetDragContext.Provider;

/**
 * The enclosing sheet's drag state.
 *
 * @throws Outside a {@link DraggableModal}.
 */
export function useSheetDrag(): SheetDrag {
  const drag = useContext(SheetDragContext);

  if (drag === undefined) {
    throw new Error('useSheetDrag must be used inside a DraggableModal.');
  }

  return drag;
}

/** Captures the sheet's height at the start of a drag. */
export function beginSheetDrag(drag: SheetDrag): void {
  'worklet';
  drag.dragStartFraction.value = drag.fraction.value;
}

/**
 * Moves the sheet with the finger, clamped between {@link SMALL_HEIGHT} and
 * {@link LARGE_HEIGHT}.
 *
 * @param translationY - Distance moved since the drag began, in points.
 */
export function updateSheetDrag(drag: SheetDrag, translationY: number): void {
  'worklet';
  if (drag.availableHeight.value === 0) return;

  const next =
    drag.dragStartFraction.value - translationY / drag.availableHeight.value;

  drag.fraction.value = Math.min(Math.max(next, SMALL_HEIGHT), LARGE_HEIGHT);
}

/**
 * Settles the sheet once the finger lifts.
 *
 * A drag longer than {@link SIGNIFICANT_DRAG} settles the way it was going. A
 * shorter one settles the other way, so a stray nudge resolves to a definite
 * height.
 *
 * @param translationY - Total distance moved from the start of the drag.
 */
export function endSheetDrag(drag: SheetDrag, translationY: number): void {
  'worklet';
  const draggedUp = translationY < 0;
  const isSignificant = Math.abs(translationY) > SIGNIFICANT_DRAG;
  const goUp = isSignificant ? draggedUp : !draggedUp;

  drag.fraction.value = withTiming(goUp ? LARGE_HEIGHT : SMALL_HEIGHT, {
    duration: drag.snapDuration,
  });
}
