import { Keyboard, ScrollView, Text, View } from 'react-native';

import { Dot } from '@/core/components/dot';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { useTheme } from '@/core/theme/use-theme';
import type { Station } from '../../../domain/models/station';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../stores/use-map-stores';

/** Tallest the results list grows before it scrolls. */
const MAX_HEIGHT = 250;

/**
 * The station hits for the current query.
 *
 * Picking one loads its reachability and collapses the list.
 */
export function SearchResults() {
  const theme = useTheme();
  const state = useStationSearchStore((store) => store.state);
  const collapse = useStationSearchStore((store) => store.collapse);
  const loadReachability = useStationDeparturesStore(
    (store) => store.loadReachability
  );

  const stations =
    state.status === 'loading' || state.status === 'loaded'
      ? state.stations
      : [];

  if (stations.length === 0) return null;

  return (
    <ScrollView
      style={{ maxHeight: MAX_HEIGHT }}
      keyboardShouldPersistTaps="handled"
    >
      {stations.map((station, index) => (
        <FadePressable
          key={station.id}
          // Alternating press depth gives the list a subtle zebra rhythm as
          // you run down it — straight from the Flutter original.
          minOpacity={index % 2 === 0 ? 0.1 : 0.6}
          onPress={() => {
            void loadReachability(station);
            collapse();
            Keyboard.dismiss();
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.medium,
              paddingVertical: theme.spacing.xSmall,
            }}
          >
            <Text style={[theme.text.body, { color: theme.colors.text }]}>
              {station.name}
            </Text>

            {describeArea(station) !== undefined && (
              <>
                <Gap size="xSmall" />
                <Dot />
                <Gap size="xSmall" />

                <Text
                  numberOfLines={1}
                  style={[
                    theme.text.body,
                    { color: theme.colors.hint, flex: 1 },
                  ]}
                >
                  {describeArea(station)}
                </Text>
              </>
            )}
          </View>
        </FadePressable>
      ))}
    </ScrollView>
  );
}

/** Renders the country and area a station sits in, whichever are known. */
function describeArea(station: Station): string | undefined {
  const { countryCode, area } = station;

  if (countryCode !== undefined && area !== undefined) {
    return `${countryCode}, ${area}`;
  }

  return area ?? countryCode;
}
