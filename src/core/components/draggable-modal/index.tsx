import { useCallback, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { View } from 'react-native';

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

export { ModalList } from './_modal-list';
export { ModalScrollView } from './_modal-scroll-view';

const LEGEND_FADE_TRAVEL = 0.08;

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
 * The sheet is always laid out at its full height and moved with
 * `translateY`, so a drag costs no layout pass. What that pushes below the
 * screen is given back to the body as bottom padding, which only has to be
 * right once the sheet settles — mid-drag nobody is scrolling.
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
  const availableHeight = useSharedValue(0);
  const dragStartFraction = useSharedValue(MEDIUM_HEIGHT);

  const [sheetHeight, setSheetHeight] = useState(0);
  const [settledFraction, setSettledFraction] = useState(MEDIUM_HEIGHT);

  const handleSettle = useCallback((detent: number) => {
    setSettledFraction(detent);
    selectionTick();
  }, []);

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

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - fraction.value) * availableHeight.value }],
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
        { flex: 1, justifyContent: 'flex-end', overflow: 'hidden' },
      ]}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;

        availableHeight.value = height;
        setSheetHeight(height);
      }}
    >
      <Animated.View
        style={[sheetStyle, pointerEvents.passThrough, { flex: 1 }]}
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
            <View style={{ paddingHorizontal: theme.spacing.medium }}>
              <Gap size="medium" axis="vertical" />

              <ModalHandle />

              <Gap size="medium" axis="vertical" />

              <ModalHeader title={title} onBack={onBack} />
            </View>
          </GestureDetector>

          <SheetDragProvider value={drag}>
            <View
              style={{
                flex: 1,
                paddingBottom: (1 - settledFraction) * sheetHeight,
              }}
            >
              {children}
            </View>
          </SheetDragProvider>
        </TranslucentSurface>
      </Animated.View>
    </View>
  );
}
