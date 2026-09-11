import * as WebBrowser from 'expo-web-browser';
import { Text, type TextStyle } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+)/g;

const URL_TEST_PATTERN = /^https?:\/\/[^\s]+$/;

interface LinkTextProps {
  readonly text: string;
  readonly style?: TextStyle;
}

/**
 * Renders `text` as plain copy, turning any URL substrings into links that
 * open in the browser when pressed.
 */
export function LinkText({ text, style }: LinkTextProps): React.JSX.Element {
  const theme = useTheme();

  const baseStyle: TextStyle = {
    ...theme.text.callout,
    color: theme.colors.hint,
    ...style,
  };

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
