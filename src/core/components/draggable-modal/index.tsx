import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';
import { Gap } from '../gap';
import { pointerEvents } from '../pointer-events';
import { TranslucentSurface } from '../translucent-surface';
import { Header } from './_header';
import { ModalHandle } from './_modal-handle';
import {
  beginSheetDrag,
  DRAG_ACTIVATION_SLOP,
  endSheetDrag,
  MEDIUM_HEIGHT,
  SheetDragProvider,
  updateSheetDrag,
  type SheetDrag,
} from './_sheet-drag';

export { ModalScrollView } from './_modal-scroll-view';

/** How far past the resting height the legend takes to fade out. */
const LEGEND_FADE_TRAVEL = 0.08;

interface DraggableModalProps {
  readonly title: string;
  readonly showBackButton: boolean;
  readonly onBackPressed?: () => void;
  /** Sits above the sheet, and fades away once it is drawn up past medium. */
  readonly legend?: React.ReactNode;
  readonly children: React.ReactNode;
}

/**
 * The bottom sheet the app's content lives in.
 *
 * The handle and header drag it outright; the body drags it too, but only
 * where a scroll would have nothing left to give — see {@link ModalScrollView},
 * which every scrolling child should be built from.
 *
 * The gesture and the height it drives both live on the UI thread: the sheet
 * has to keep up with a finger, and a JS-driven height animation cannot
 * promise that on a device.
 */
export function DraggableModal({
  title,
  showBackButton,
  onBackPressed,
  legend,
  children,
}: DraggableModalProps) {
  const theme = useTheme();

  const fraction = useSharedValue(MEDIUM_HEIGHT);
  const availableHeight = useSharedValue(0);
  const dragStartFraction = useSharedValue(MEDIUM_HEIGHT);

  const snapDuration = theme.durations.medium;

  /*
    Deliberately not memoised: the shared values inside it are the stable part,
    and handing them to a hook would make every write to them — the layout
    measurement below, the drag itself — a mutation of a memoised value.
  */
  const drag: SheetDrag = {
    fraction,
    availableHeight,
    dragStartFraction,
    snapDuration,
  };

  const handleDrag = Gesture.Pan()
    // Otherwise the sheet fights every tap that wobbles a pixel.
    .activeOffsetY([-DRAG_ACTIVATION_SLOP, DRAG_ACTIVATION_SLOP])
    .onStart(() => beginSheetDrag(drag))
    .onUpdate((event) => updateSheetDrag(drag, event.translationY))
    .onEnd((event) => endSheetDrag(drag, event.translationY));

  const sheetStyle = useAnimatedStyle(() => ({
    height: fraction.value * availableHeight.value,
  }));

  /*
    The legend belongs to the map, so it gets out of the way once the sheet is
    drawn up over it.

    The range starts exactly at the resting height so that at rest the opacity
    is exactly 1. Anything less creates a backdrop root above the legends and
    silently kills their blur.
  */
  const legendStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      fraction.value,
      [MEDIUM_HEIGHT, MEDIUM_HEIGHT + LEGEND_FADE_TRAVEL],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View
      // Above the sheet is map, not chrome — let taps through.
      style={[
        pointerEvents.passThrough,
        { flex: 1, justifyContent: 'flex-end' },
      ]}
      onLayout={(event) => {
        availableHeight.value = event.nativeEvent.layout.height;
      }}
    >
      <Animated.View style={[sheetStyle, pointerEvents.passThrough]}>
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
            <View style={{ paddingHorizontal: theme.spacing.medium }}>
              <Gap size="medium" axis="vertical" />

              <ModalHandle />

              <Gap size="medium" axis="vertical" />

              <Header
                title={title}
                showBackButton={showBackButton}
                onBackPressed={onBackPressed}
              />
            </View>
          </GestureDetector>

          <SheetDragProvider value={drag}>
            <View style={{ flex: 1 }}>{children}</View>
          </SheetDragProvider>
        </TranslucentSurface>
      </Animated.View>
    </View>
  );
}
