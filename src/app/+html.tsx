import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * The HTML document wrapping the web build.
 *
 * Server-rendered only — this never runs in the browser and has no access to
 * app state.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <meta name="description" content="See where transit takes you!" />
        <meta name="apple-mobile-web-app-title" content="Station Reach" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Offers the native app from Safari on iOS. */}
        <meta name="apple-itunes-app" content="app-id=6752408029" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: ROOT_STYLE }} />
      </head>

      <body>{children}</body>
    </html>
  );
}

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
