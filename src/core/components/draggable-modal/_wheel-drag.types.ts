import type { SheetDrag } from './_sheet-drag';

/** Attaches a wheel drag to a view. Pass it as that view's `ref`. */
export type WheelTarget = (node: unknown) => void;

/**
 * Whether the sheet takes a wheel event, rather than the view under the
 * pointer. Asked on every event until it first says no, since the sheet moves
 * as it is asked and can move past the answer.
 *
 * @param translationY - Pixels the event moves by, positive downwards, on the
 * same scale and sign as a pan gesture's translation.
 */
export type TakesWheel = (translationY: number) => boolean;

/**
 * Moves a {@link DraggableModal}'s sheet with a wheel — a trackpad two-finger
 * swipe up or down, or a mouse wheel — over the view the returned
 * {@link WheelTarget} is attached to.
 *
 * Only the web has a wheel; the native implementation is a no-op.
 */
export type UseWheelDrag = (
  drag: SheetDrag,
  takesWheel: TakesWheel
) => WheelTarget;
