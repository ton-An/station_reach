import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { t } from '@/core/i18n/translate';

export default function Root({
  children,
}: PropsWithChildren): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <meta name="description" content={t('webDescription')} />
        <meta name="apple-mobile-web-app-title" content="Station Reach" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-itunes-app" content="app-id=6752408029" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: ROOT_STYLE }} />
      </head>

      <body>{children}</body>
    </html>
  );
}

/**
 * Global web-only styles: removes the page margin and browser overscroll
 * bounce, and hides the focus outline on the search field's `<input>`.
 */
const ROOT_STYLE = `
body {
  margin: 0;
  overscroll-behavior: none;
}

input:focus,
input:focus-visible {
  outline: none;
}
`;
