import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTheme } from '@/core/theme/use-theme';
import { t } from '@/core/i18n/translate';
import {
  SEARCH_DEBOUNCE_MS,
  useStationSearchStore,
} from '../../stores/station-search-store';

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
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.medium,
      }}
    >
      <MaterialIcons name="search" size={28} color={theme.colors.hint} />

      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder={t('searchStations')}
        placeholderTextColor={theme.colors.hint}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor={theme.colors.primary}
        style={[
          theme.text.body,
          {
            flex: 1,
            marginLeft: theme.spacing.xSmall,
            color: theme.colors.text,
            // React Native Web draws a focus ring that fights the blurred card.
            outlineWidth: 0,
          },
        ]}
      />
    </View>
  );
}
