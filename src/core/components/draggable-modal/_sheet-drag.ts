import { createContext, useContext } from 'react';
import { withTiming, type SharedValue } from 'react-native-reanimated';

/** Collapsed. */
export const SMALL_HEIGHT = 0.3;
/** Where the sheet opens, and the point past which the legend hides. */
export const MEDIUM_HEIGHT = 0.6;
/** Fully drawn up. */
export const LARGE_HEIGHT = 1;

/** How far the sheet must travel before the drag counts as intentional. */
const SIGNIFICANT_DRAG = 70;

/** How far a finger must move vertically before the sheet claims the gesture. */
export const DRAG_ACTIVATION_SLOP = 2;

/**
 * The sheet's live drag state, shared with whatever is scrolling inside it.
 *
 * All of it lives on the UI thread: the sheet has to keep up with a finger,
 * and the body's scroll offset decides — mid-touch, before a frame is drawn —
 * whether the next pixel scrolls the list or moves the sheet.
 */
export interface SheetDrag {
  /** How much of the available height the sheet currently occupies. */
  readonly fraction: SharedValue<number>;
  /** Measured, so a drag can be expressed as a fraction of what's on screen. */
  readonly availableHeight: SharedValue<number>;
  readonly dragStartFraction: SharedValue<number>;
  readonly snapDuration: number;
}

const SheetDragContext = createContext<SheetDrag | undefined>(undefined);

export const SheetDragProvider = SheetDragContext.Provider;

/**
 * The enclosing sheet's drag state.
 *
 * Throws outside a `DraggableModal`, which is a wiring mistake rather than a
 * runtime condition worth a `Failure`.
 */
export function useSheetDrag(): SheetDrag {
  const drag = useContext(SheetDragContext);

  if (drag === undefined) {
    throw new Error('useSheetDrag must be used inside a DraggableModal.');
  }

  return drag;
}

/** Remembers where the sheet stood when the finger went down. */
export function beginSheetDrag(drag: SheetDrag): void {
  'worklet';
  drag.dragStartFraction.value = drag.fraction.value;
}

/** Moves the sheet with the finger, within its two extremes. */
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
 * A drag shorter than {@link SIGNIFICANT_DRAG} deliberately snaps the *other*
 * way, so a stray nudge resolves to a definite state instead of leaving the
 * sheet parked mid-way.
 */
export function endSheetDrag(drag: SheetDrag, translationY: number): void {
  'worklet';
  // Negative translation is upward.
  const draggedUp = translationY < 0;
  const isSignificant = Math.abs(translationY) > SIGNIFICANT_DRAG;
  const goUp = isSignificant ? draggedUp : !draggedUp;

  drag.fraction.value = withTiming(goUp ? LARGE_HEIGHT : SMALL_HEIGHT, {
    duration: drag.snapDuration,
  });
}
