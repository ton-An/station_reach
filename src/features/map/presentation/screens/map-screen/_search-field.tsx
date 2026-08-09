import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/core/components/icon';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import { withAlpha } from '@/core/helpers/color-helper';
import { SEARCH_DEBOUNCE_MS } from '../../stores/station-search-store';
import { useStationSearchStore } from '../../stores/use-map-stores';

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

  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timer.current = setTimeout(() => void search(query), SEARCH_DEBOUNCE_MS);

    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, [query, search]);

  return (
    /*
      The whole row focuses the field, and the field fills the row.

      A `TextInput` sizes itself to one line of text, so centring it in a 54pt
      row left the real hit area a ~23pt band starting after the icon — and a
      tap anywhere else was swallowed rather than passed on, because the card
      above the map is opaque to touch. Between the two, "tap the search box"
      missed more often than it hit.
    */
    <Pressable
      accessible={false}
      onPress={() => input.current?.focus()}
      style={{
        height: FIELD_HEIGHT,
        flexDirection: 'row',
        alignItems: 'stretch',
      }}
    >
      <View
        // The icon is decoration; let its taps reach the row.
        style={{
          justifyContent: 'center',
          paddingLeft: theme.spacing.medium + theme.spacing.small,
          paddingRight: theme.spacing.xSmall,
          pointerEvents: 'none',
        }}
      >
        <Icon name="search" size={28} color={theme.colors.hint} />
      </View>

      <TextInput
        ref={input}
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
            alignSelf: 'stretch',
            paddingRight: theme.spacing.medium,
            // Android tops out its own padding and top-aligns the text once the
            // box is taller than a line; both platforms centre it from here.
            paddingVertical: 0,
            textAlignVertical: 'center',
            color: theme.colors.text,
            // React Native Web draws a focus ring that fights the blurred card.
            outlineWidth: 0,
          },
        ]}
      />
    </Pressable>
  );
}
