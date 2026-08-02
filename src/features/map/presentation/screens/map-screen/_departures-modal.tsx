/*
  To-Do:
    - [ ] The Flutter modal could be dragged to resize. This one is a fixed
          height; add a drag handle if the shorter list turns out to bite.
*/

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Animated, Text, useWindowDimensions, View } from 'react-native';

import { FadePressable } from '@/core/components/fade-pressable';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { t } from '@/core/i18n/translate';
import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';
import { WIDE_LAYOUT_BREAKPOINT } from '@/core/theme/theme';
import { useDepartureSelectionStore } from '../../stores/departure-selection-store';
import { useStationSelectionStore } from '../../stores/station-selection-store';
import { DepartureItinerary } from './_departure-itinerary';
import { DeparturesList } from './_departures-list';
import { OVERLAY_MAX_WIDTH } from './_search';

/** How much of the screen height the modal occupies. */
export const MODAL_HEIGHT_FRACTION = 0.45;

/**
 * The bottom sheet listing departures, and the itinerary behind it.
 *
 * The two panes slide horizontally: the list is the root, and picking a
 * departure pushes its itinerary in from the right.
 */
export function DeparturesModal() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  const stationSelection = useStationSelectionStore((store) => store.state);
  const departureSelection = useDepartureSelectionStore((store) => store.state);
  const deselectDeparture = useDepartureSelectionStore(
    (store) => store.deselect
  );

  const isItineraryOpen = departureSelection.status === 'selected';
  const [slide] = useState(() => new Animated.Value(0));

  // Measured, because `translateX` must be a number — a percentage string is
  // silently ignored by the native animation driver.
  const [paneWidth, setPaneWidth] = useState(0);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: isItineraryOpen ? 1 : 0,
      duration: theme.durations.xShort,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [isItineraryOpen, slide, theme.durations.xShort]);

  const isWide = width >= WIDE_LAYOUT_BREAKPOINT;

  return (
    <View
      style={{
        position: 'absolute',
        right: isWide ? theme.spacing.medium : 0,
        left: isWide ? undefined : 0,
        bottom: 0,
        alignItems: isWide ? 'flex-end' : 'center',
        paddingHorizontal: isWide ? 0 : theme.spacing.medium,
        // Only the card itself takes input; the gutter beside it belongs to
        // the map.
        pointerEvents: 'none',
      }}
    >
      <TranslucentSurface
        bordered
        radius={theme.radii.large}
        style={{
          width: '100%',
          maxWidth: OVERLAY_MAX_WIDTH,
          height: height * MODAL_HEIGHT_FRACTION,
          marginBottom: theme.spacing.medium,
          pointerEvents: 'auto',
        }}
      >
        <Header
          title={modalTitle(stationSelection, departureSelection)}
          showBack={isItineraryOpen}
          onBack={deselectDeparture}
        />

        <View
          style={{ flex: 1, overflow: 'hidden' }}
          onLayout={(event) => setPaneWidth(event.nativeEvent.layout.width)}
        >
          <Animated.View
            style={{
              flex: 1,
              flexDirection: 'row',
              width: paneWidth * 2,
              transform: [
                {
                  translateX: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -paneWidth],
                  }),
                },
              ],
            }}
          >
            <View style={{ width: paneWidth }}>
              <DeparturesList />
            </View>

            <View style={{ width: paneWidth }}>
              <DepartureItinerary
                departure={
                  departureSelection.status === 'selected'
                    ? departureSelection.departure
                    : undefined
                }
              />
            </View>
          </Animated.View>
        </View>
      </TranslucentSurface>
    </View>
  );
}

interface HeaderProps {
  readonly title: string;
  readonly showBack: boolean;
  readonly onBack: () => void;
}

function Header({ title, showBack, onBack }: HeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.xSmall,
      }}
    >
      {showBack && (
        <FadePressable
          onPress={onBack}
          style={{ marginRight: theme.spacing.xSmall }}
        >
          <MaterialIcons
            name="chevron-left"
            size={26}
            color={theme.colors.text}
          />
        </FadePressable>
      )}

      <Text
        numberOfLines={1}
        style={[theme.text.title3, { color: theme.colors.text, flexShrink: 1 }]}
      >
        {title}
      </Text>
    </View>
  );
}

/**
 * Names the modal after whatever the user is currently looking at.
 *
 * The itinerary wins over the stop, because that is the more specific thing
 * on screen once one is open.
 */
function modalTitle(
  stationSelection: ReturnType<
    typeof useStationSelectionStore.getState
  >['state'],
  departureSelection: ReturnType<
    typeof useDepartureSelectionStore.getState
  >['state']
): string {
  if (departureSelection.status === 'selected') {
    return departureSelection.departure.name;
  }

  if (stationSelection.status === 'selected') {
    return stationSelection.selectedStop.name;
  }

  return t('departures');
}
