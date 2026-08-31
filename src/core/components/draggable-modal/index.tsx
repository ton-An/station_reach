import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { View, type LayoutRectangle } from 'react-native';

import { selectionTick } from '@/core/helpers/haptics-helper';
import { useTheme } from '@/core/theme/use-theme';
import { Gap } from '../gap';
import { pointerEvents } from '../pointer-events';
import { TranslucentSurface } from '../translucent-surface';
import { ModalHandle } from './_modal-handle';
import { ModalHeader } from './_modal-header';
import {
  beginSheetDrag,
  DRAG_ACTIVATION_SLOP,
  MEDIUM_HEIGHT,
  settleSheetDrag,
  SheetDragProvider,
  updateSheetDrag,
  type SheetDrag,
} from './_sheet-drag';
import { useWheelDrag } from './_wheel-drag';

export { ModalList } from './_modal-list';
export { ModalScrollView } from './_modal-scroll-view';

const LEGEND_FADE_TRAVEL = 0.08;

/**
 * Decelerating, because the box it follows resizes in one frame. The default
 * easing of `withTiming` accelerates in, which holds the sheet still for the
 * first part of the duration and reads as the sheet answering late.
 */
const LAYOUT_SHIFT_EASING = Easing.out(Easing.cubic);

interface DraggableModalProps {
  readonly title: string;
  readonly onBack?: () => void;
  readonly legend?: React.ReactNode;
  readonly children: React.ReactNode;
}

/**
 * Bottom sheet the user drags between three heights, springing to the
 * detent the release was heading for.
 *
 * The handle and header drag the sheet. The body scrolls instead, through
 * {@link ModalList} or {@link ModalScrollView}, which give the drag back to
 * the sheet once the content is scrolled to its top. The legend sits above
 * the sheet and fades out as the sheet is pulled over it.
 *
 * On the web a wheel — a trackpad two-finger swipe up or down — moves the
 * sheet a detent per swipe, everywhere a touch drags it and by the same rule.
 * See {@link useWheelDrag}.
 *
 * The sheet is laid out at the tallest its box has ever been, pinned to the
 * bottom of that box, and every height it is shown at is `translateY` off
 * that one frame. A drag therefore costs no layout pass. What the translation
 * pushes below the screen is given back to the body as bottom padding, which
 * only has to be right once the sheet settles — mid-drag nobody is scrolling.
 *
 * The box belongs to the screen around it: a panel opening above the sheet,
 * such as a list of search results, takes its height off the box's top and
 * the sheet is expected to follow it down. The sheet holds the place it was
 * in when that happens and eases the difference away.
 *
 * Sizing the sheet to the box instead would defeat both. The box moves the
 * sheet the moment it is measured, a frame before anything animated can
 * answer, and the sheet is seen at its destination before it sets off.
 *
 * Sub-components:
 * - {@link ModalHandle}: the grab indicator
 * - {@link ModalHeader}: title and optional back button
 */
export function DraggableModal({
  title,
  onBack,
  legend,
  children,
}: DraggableModalProps): React.JSX.Element {
  const theme = useTheme();

  const fraction = useSharedValue(MEDIUM_HEIGHT);
  const sheetHeight = useSharedValue(0);
  const availableHeight = useSharedValue(0);
  const dragStartFraction = useSharedValue(MEDIUM_HEIGHT);
  const settledFraction = useSharedValue(MEDIUM_HEIGHT);
  const layoutShift = useSharedValue(0);

  const handleSettle = (detent: number) => {
    settledFraction.value = detent;
    selectionTick();
  };

  const handleLayout = ({ height }: LayoutRectangle) => {
    // The box is pinned to the bottom of the screen, so it gives up height off
    // its top and carries the sheet down by `fraction` of what it lost. Hold
    // the sheet where it was and ease that offset out, or the whole move lands
    // between two frames. Skipped on the first layout, which has no place to
    // hold.
    if (availableHeight.value !== 0) {
      layoutShift.value += fraction.value * (height - availableHeight.value);
      layoutShift.value = withTiming(0, {
        duration: theme.durations.xShort,
        easing: LAYOUT_SHIFT_EASING,
      });
    }

    availableHeight.value = height;

    // The tallest the box has ever been is as tall as the sheet ever needs to
    // be. Written beside the translation that reads it, so the sheet is never
    // laid out for one size and moved for another.
    sheetHeight.value = Math.max(sheetHeight.value, height);
  };

  const drag: SheetDrag = {
    fraction,
    availableHeight,
    dragStartFraction,
    onSettle: handleSettle,
  };

  const handleDrag = Gesture.Pan()
    .activeOffsetY([-DRAG_ACTIVATION_SLOP, DRAG_ACTIVATION_SLOP])
    .onStart(() => beginSheetDrag(drag))
    .onUpdate((event) => updateSheetDrag(drag, event.translationY))
    .onEnd((event) => settleSheetDrag(drag, event.velocityY));

  // Nothing scrolls under the handle and the header, so every wheel over them
  // is the sheet's.
  const handleWheel = useWheelDrag(drag, () => true);

  const sheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
    transform: [
      {
        translateY:
          sheetHeight.value -
          fraction.value * availableHeight.value +
          layoutShift.value,
      },
    ],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    paddingBottom:
      sheetHeight.value - settledFraction.value * availableHeight.value,
  }));

  const legendStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      fraction.value,
      [MEDIUM_HEIGHT, MEDIUM_HEIGHT + LEGEND_FADE_TRAVEL],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    // Deliberately unclipped: while the sheet is held after a resize it
    // stands above its box, and clipping here would cut its top off for as
    // long as it eases back down. The screen it sits on clips instead.
    <View
      style={[pointerEvents.passThrough, { flex: 1 }]}
      onLayout={(event) => handleLayout(event.nativeEvent.layout)}
    >
      <Animated.View
        style={[
          sheetStyle,
          pointerEvents.passThrough,
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
        ]}
      >
        {legend !== undefined && (
          <Animated.View
            style={[
              legendStyle,
              pointerEvents.passThrough,
              { paddingHorizontal: theme.spacing.medium },
            ]}
          >
            {legend}
          </Animated.View>
        )}

        <Gap size="small" axis="vertical" />

        <TranslucentSurface topRadius={theme.radii.xLarge} style={{ flex: 1 }}>
          <GestureDetector gesture={handleDrag}>
            <View
              ref={handleWheel}
              style={{ paddingHorizontal: theme.spacing.medium }}
            >
              <Gap size="medium" axis="vertical" />

              <ModalHandle />

              <Gap size="medium" axis="vertical" />

              <ModalHeader title={title} onBack={onBack} />
            </View>
          </GestureDetector>

          <SheetDragProvider value={drag}>
            <Animated.View style={[bodyStyle, { flex: 1 }]}>
              {children}
            </Animated.View>
          </SheetDragProvider>
        </TranslucentSurface>
      </Animated.View>
    </View>
  );
}
