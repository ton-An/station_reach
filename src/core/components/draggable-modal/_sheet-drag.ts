import { createContext, useContext } from 'react';
import { withTiming, type SharedValue } from 'react-native-reanimated';

/**
 * Fractions of the sheet's available height it can snap to. A drag only
 * ever settles on {@link SMALL_HEIGHT} or {@link LARGE_HEIGHT} — see
 * {@link endSheetDrag}. {@link MEDIUM_HEIGHT} is just the sheet's initial
 * resting fraction.
 */
export const SMALL_HEIGHT = 0.3;
export const MEDIUM_HEIGHT = 0.6;
export const LARGE_HEIGHT = 1;

/** Drag travel, in pixels, above which {@link endSheetDrag} follows the drag. */
const SIGNIFICANT_DRAG = 70;

/**
 * Vertical travel, in pixels, a touch must move before a pan gesture starts
 * dragging the sheet. Filters out taps and near-stationary touches.
 */
export const DRAG_ACTIVATION_SLOP = 2;

/**
 * Sheet-drag state shared, through {@link SheetDragProvider}, between the
 * sheet shell in {@link DraggableModal} and its scrollable body. Every field
 * is a `SharedValue` so the worklets in this file can update it on the UI
 * thread.
 */
export interface SheetDrag {
  /** Current sheet height, as a fraction of `availableHeight`. */
  readonly fraction: SharedValue<number>;
  readonly availableHeight: SharedValue<number>;
  readonly dragStartFraction: SharedValue<number>;
  readonly snapDuration: number;
}

const SheetDragContext = createContext<SheetDrag | undefined>(undefined);

export const SheetDragProvider = SheetDragContext.Provider;

/**
 * Reads the {@link SheetDrag} state shared by the nearest
 * {@link DraggableModal}.
 *
 * @throws Error when called outside a {@link DraggableModal}.
 */
export function useSheetDrag(): SheetDrag {
  const drag = useContext(SheetDragContext);

  if (drag === undefined) {
    throw new Error('useSheetDrag must be used inside a DraggableModal.');
  }

  return drag;
}

/**
 * Starts a sheet drag: records the sheet's current height fraction as the
 * point the drag moves from. Runs on the UI thread inside a gesture's
 * `onStart`.
 */
export function beginSheetDrag(drag: SheetDrag): void {
  'worklet';
  drag.dragStartFraction.value = drag.fraction.value;
}

/**
 * Moves the sheet with an in-progress drag: adds the drag's vertical
 * translation, as a fraction of `availableHeight`, to the fraction
 * {@link beginSheetDrag} recorded, clamped between {@link SMALL_HEIGHT} and
 * {@link LARGE_HEIGHT}. Does nothing until the sheet has been laid out.
 * Runs on the UI thread inside a gesture's `onUpdate`.
 */
export function updateSheetDrag(drag: SheetDrag, translationY: number): void {
  'worklet';
  if (drag.availableHeight.value === 0) return;

  const next =
    drag.dragStartFraction.value - translationY / drag.availableHeight.value;

  drag.fraction.value = Math.min(Math.max(next, SMALL_HEIGHT), LARGE_HEIGHT);
}

/**
 * Ends a sheet drag, animating the sheet to {@link LARGE_HEIGHT} or
 * {@link SMALL_HEIGHT}. A drag whose travel exceeds `SIGNIFICANT_DRAG`
 * settles in the direction it was dragged; a shorter drag settles in the
 * opposite direction. Runs on the UI thread inside a gesture's `onEnd`.
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
