import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';

import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import { withAlpha } from '@/core/helpers/color-helper';
import {
  SEARCH_DEBOUNCE_MS,
  useStationSearchStore,
} from '../../stores/station-search-store';

/** The field's fixed height, matching the Flutter `CupertinoTextField`. */
const FIELD_HEIGHT = 54;

/**
 * The station search input.
 *
 * Debounces before searching — the Flutter version fired a request on every
 * keystroke, which hammered a free community API for results nobody read.
 */
export function SearchField() {
  const theme = useTheme();
  const search = useStationSearchStore((store) => store.search);

  const [query, setQuery] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timer.current = setTimeout(() => void search(query), SEARCH_DEBOUNCE_MS);

    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, [query, search]);

  return (
    <View
      style={{
        height: FIELD_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          paddingLeft: theme.spacing.medium + theme.spacing.small,
          paddingRight: theme.spacing.xSmall,
        }}
      >
        <MaterialIcons name="search" size={28} color={theme.colors.hint} />
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder={t('searchStations')}
        placeholderTextColor={withAlpha(theme.colors.text, 0.7)}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor={theme.colors.primary}
        style={[
          theme.text.body,
          {
            flex: 1,
            paddingRight: theme.spacing.medium,
            color: theme.colors.text,
            // React Native Web draws a focus ring that fights the blurred card.
            outlineWidth: 0,
          },
        ]}
      />
    </View>
  );
}
