import { useEffect, useState } from 'react';
import { Animated, useWindowDimensions, View } from 'react-native';

import { DraggableModal } from '@/core/components/draggable-modal';
import { pointerEvents } from '@/core/components/pointer-events';
import { t } from '@/core/i18n/translate';
import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { WIDE_LAYOUT_BREAKPOINT } from '@/core/theme/theme';
import { useTheme } from '@/core/theme/use-theme';
import type { DepartureSelectionState } from '../../stores/departure-selection-store';
import type { StationSelectionState } from '../../stores/station-selection-store';
import {
  useDepartureSelectionStore,
  useStationSelectionStore,
} from '../../stores/use-map-stores';
import { DepartureItinerary } from './_departure-itinerary';
import { DeparturesList } from './_departures-list';
import { MapLegends } from './_map-legends';
import { OVERLAY_MAX_WIDTH } from './_search';

/**
 * The departures sheet, and the itinerary behind it.
 *
 * The two panes slide horizontally: the list is the root, and picking a
 * departure pushes its itinerary in from the right.
 */
export function DeparturesModal() {
  const theme = useTheme();
  const { width } = useWindowDimensions();

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
      // Only the sheet takes input; the gutter beside it belongs to the map.
      style={[
        pointerEvents.passThrough,
        {
          flex: 1,
          alignItems: isWide ? 'flex-end' : 'center',
          paddingRight: isWide ? theme.spacing.medium : 0,
        },
      ]}
    >
      <View
        style={[
          pointerEvents.passThrough,
          {
            flex: 1,
            width: '100%',
            maxWidth: OVERLAY_MAX_WIDTH,
          },
        ]}
      >
        <DraggableModal
          title={modalTitle(stationSelection, departureSelection)}
          showBackButton={isItineraryOpen}
          onBackPressed={deselectDeparture}
          // On a wide screen the legends sit beside the map instead.
          legend={isWide ? undefined : <MapLegends />}
        >
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
        </DraggableModal>
      </View>
    </View>
  );
}

/**
 * Names the modal after whatever the user is currently looking at.
 *
 * The stop wins over the itinerary, matching the Flutter original: selecting a
 * new stop on the map is what most recently changed under the user.
 */
function modalTitle(
  stationSelection: StationSelectionState,
  departureSelection: DepartureSelectionState
): string {
  if (stationSelection.status === 'selected') {
    return stationSelection.selectedStop.name;
  }

  if (departureSelection.status === 'selected') {
    return departureSelection.departure.name;
  }

  return t('departures');
}
