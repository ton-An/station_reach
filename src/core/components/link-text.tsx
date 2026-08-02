import * as WebBrowser from 'expo-web-browser';
import { Text, type TextStyle } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

/** Splits prose into alternating text and URL segments. */
const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+)/g;

/**
 * Tests a single segment.
 *
 * Deliberately a separate, non-global regex: `test` on a `/g` pattern advances
 * `lastIndex`, so reusing the split pattern here would match every other call.
 */
const URL_TEST_PATTERN = /^https?:\/\/[^\s]+$/;

interface LinkTextProps {
  readonly text: string;
  readonly style?: TextStyle;
}

/**
 * Prose with any bare URLs turned into underlined links.
 *
 * The attribution copy is authored as one block of text rather than as
 * structured rows, so the links have to be found in it rather than declared.
 */
export function LinkText({ text, style }: LinkTextProps) {
  const theme = useTheme();

  const baseStyle: TextStyle = {
    ...theme.text.callout,
    color: theme.colors.hint,
    ...style,
  };

  // `split` with a capturing group keeps the URLs as their own segments.
  const segments = text.split(URL_SPLIT_PATTERN);

  return (
    <Text style={baseStyle}>
      {segments.map((segment, index) =>
        URL_TEST_PATTERN.test(segment) ? (
          <Text
            key={index}
            style={{ textDecorationLine: 'underline' }}
            onPress={() => void WebBrowser.openBrowserAsync(segment)}
          >
            {segment}
          </Text>
        ) : (
          segment
        )
      )}
    </Text>
  );
}
