import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';
import { Gap } from '../gap';
import { TranslucentSurface } from '../translucent-surface';
import { Header } from './_header';
import { ModalHandle } from './_modal-handle';

/** Collapsed. */
export const SMALL_HEIGHT = 0.3;
/** Where the sheet opens, and the point past which the legend hides. */
export const MEDIUM_HEIGHT = 0.6;
/** Fully drawn up. */
export const LARGE_HEIGHT = 1;

/** How far the sheet must travel before the drag counts as intentional. */
const SIGNIFICANT_DRAG = 70;

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
 * Only the handle and header drag — the body scrolls on its own, so a flick
 * through a long departure list never resizes the sheet by accident.
 *
 * A drag shorter than {@link SIGNIFICANT_DRAG} deliberately snaps the *other*
 * way, so a stray nudge resolves to a definite state instead of leaving the
 * sheet parked mid-way.
 */
export function DraggableModal({
  title,
  showBackButton,
  onBackPressed,
  legend,
  children,
}: DraggableModalProps) {
  const theme = useTheme();

  const [availableHeight, setAvailableHeight] = useState(0);
  const [fraction] = useState(() => new Animated.Value(MEDIUM_HEIGHT));

  /*
    Everything the gesture needs lives in refs, so the responder is built once
    and never has to be rebuilt as the sheet resizes or animates. The handlers
    read these refs when a finger is actually down — long after render.
  */
  const gesture = useRef({
    availableHeight: 0,
    currentFraction: MEDIUM_HEIGHT,
    dragStartFraction: MEDIUM_HEIGHT,
    snapTo: (_target: number) => {},
  });

  useEffect(() => {
    gesture.current.availableHeight = availableHeight;
    gesture.current.snapTo = (target: number) =>
      Animated.timing(fraction, {
        toValue: target,
        duration: theme.durations.medium,
        useNativeDriver: false,
      }).start();
  }, [availableHeight, fraction, theme.durations.medium]);

  useEffect(() => {
    const id = fraction.addListener(({ value }) => {
      gesture.current.currentFraction = value;
    });

    return () => fraction.removeListener(id);
  }, [fraction]);

  /*
    Built once and never rebuilt. The lint rule below flags handing refs to a
    factory during render; here the handlers only dereference them while a
    finger is down, which is exactly what a PanResponder is for.
  */
  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, event) => Math.abs(event.dy) > 2,

      onPanResponderGrant: () => {
        gesture.current.dragStartFraction = gesture.current.currentFraction;
      },

      onPanResponderMove: (_, event) => {
        const { availableHeight: height, dragStartFraction } = gesture.current;
        if (height === 0) return;

        const next = dragStartFraction - event.dy / height;
        fraction.setValue(Math.min(Math.max(next, SMALL_HEIGHT), LARGE_HEIGHT));
      },

      onPanResponderRelease: (_, event) => {
        // Negative dy is upward.
        const draggedUp = event.dy < 0;
        const isSignificant = Math.abs(event.dy) > SIGNIFICANT_DRAG;
        const goUp = isSignificant ? draggedUp : !draggedUp;

        gesture.current.snapTo(goUp ? LARGE_HEIGHT : SMALL_HEIGHT);
      },

      onPanResponderTerminate: () => gesture.current.snapTo(SMALL_HEIGHT),
    })
  );

  const height = fraction.interpolate({
    inputRange: [0, 1],
    outputRange: [0, availableHeight],
  });

  /*
    The legend belongs to the map, so it gets out of the way once the sheet is
    drawn up over it.

    The range starts exactly at the resting height so that at rest the opacity
    is exactly 1. Anything less creates a backdrop root above the legends and
    silently kills their blur.
  */
  const legendOpacity = fraction.interpolate({
    inputRange: [MEDIUM_HEIGHT, MEDIUM_HEIGHT + 0.08],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      // Above the sheet is map, not chrome — let taps through.
      style={{ flex: 1, justifyContent: 'flex-end', pointerEvents: 'none' }}
      onLayout={(event) => setAvailableHeight(event.nativeEvent.layout.height)}
    >
      <Animated.View style={{ height, pointerEvents: 'none' }}>
        {legend !== undefined && (
          <Animated.View
            style={{
              opacity: legendOpacity,
              paddingHorizontal: theme.spacing.medium,
              pointerEvents: 'auto',
            }}
          >
            {legend}
          </Animated.View>
        )}

        <Gap size="small" axis="vertical" />

        <TranslucentSurface
          topRadius={theme.radii.xLarge}
          style={{ flex: 1, pointerEvents: 'auto' }}
        >
          <View
            {...panResponder.panHandlers}
            style={{ paddingHorizontal: theme.spacing.medium }}
          >
            <Gap size="medium" axis="vertical" />

            <ModalHandle />

            <Gap size="medium" axis="vertical" />

            <Header
              title={title}
              showBackButton={showBackButton}
              onBackPressed={onBackPressed}
            />
          </View>

          <View style={{ flex: 1 }}>{children}</View>
        </TranslucentSurface>
      </Animated.View>
    </View>
  );
}
