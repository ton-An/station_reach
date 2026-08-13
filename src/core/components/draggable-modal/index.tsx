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

export { ModalList } from './_modal-list';
export { ModalScrollView } from './_modal-scroll-view';

const LEGEND_FADE_TRAVEL = 0.08;

interface DraggableModalProps {
  readonly title: string;
  /** Shows a back button in the header. */
  readonly onBack?: () => void;
  /** Sits above the sheet and fades out as the sheet is drawn up. */
  readonly legend?: React.ReactNode;
  readonly children: React.ReactNode;
}

/**
 * The bottom sheet the app's content lives in.
 *
 * The sheet opens at {@link MEDIUM_HEIGHT} and settles at either
 * {@link SMALL_HEIGHT} or {@link LARGE_HEIGHT} once a drag ends. A scrolling
 * child has to be built from {@link ModalScrollView} or {@link ModalList},
 * which share the finger with the sheet.
 */
export function DraggableModal({
  title,
  onBack,
  legend,
  children,
}: DraggableModalProps): React.JSX.Element {
  const theme = useTheme();

  const fraction = useSharedValue(MEDIUM_HEIGHT);
  const availableHeight = useSharedValue(0);
  const dragStartFraction = useSharedValue(MEDIUM_HEIGHT);

  const snapDuration = theme.durations.medium;

  const drag: SheetDrag = {
    fraction,
    availableHeight,
    dragStartFraction,
    snapDuration,
  };

  const handleDrag = Gesture.Pan()
    .activeOffsetY([-DRAG_ACTIVATION_SLOP, DRAG_ACTIVATION_SLOP])
    .onStart(() => beginSheetDrag(drag))
    .onUpdate((event) => updateSheetDrag(drag, event.translationY))
    .onEnd((event) => endSheetDrag(drag, event.translationY));

  const sheetStyle = useAnimatedStyle(() => ({
    height: fraction.value * availableHeight.value,
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
    <View
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

              <Header title={title} onBack={onBack} />
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
