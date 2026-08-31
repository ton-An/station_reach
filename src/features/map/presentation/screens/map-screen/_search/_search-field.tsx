import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/core/components/icon';
import { withAlpha } from '@/core/helpers/color-helper';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import { useStationSearchStore } from '../../../stores/use-map-stores';

const FIELD_HEIGHT = 54;

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Debounces the typed query by {@link SEARCH_DEBOUNCE_MS} before calling
 * {@link StationSearchStore.search}. Submitting from the keyboard only
 * dismisses it; the debounced search is already in flight.
 */
export function SearchField(): React.JSX.Element {
  const theme = useTheme();
  const search = useStationSearchStore((store) => store.search);

  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => void search(query), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, search]);

  return (
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
        style={{
          justifyContent: 'center',
          paddingLeft: theme.spacing.xxMedium,
          paddingRight: theme.spacing.xSmall,
          pointerEvents: 'none',
        }}
      >
        <Icon
          name="search"
          size={theme.icons.medium}
          color={theme.colors.hint}
        />
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
            paddingVertical: 0,
            textAlignVertical: 'center',
            color: theme.colors.text,
            outlineWidth: 0,
          },
        ]}
      />
    </Pressable>
  );
}
