import type { UseWheelDrag, WheelTarget } from './_wheel-drag.types';

const IGNORE_TARGET: WheelTarget = () => undefined;

/** No-op {@link UseWheelDrag}: a native target has no wheel. */
export const useWheelDrag: UseWheelDrag = () => IGNORE_TARGET;
