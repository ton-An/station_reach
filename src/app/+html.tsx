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
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
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

/**
 * Gives the React Native root a height to lay out against.
 *
 * Without this the whole tree collapses to zero height and the map renders as
 * a 400x300 stub — react-native-web has no intrinsic sizing to fall back on.
 */
const ROOT_STYLE = `
html, body, #root {
  height: 100%;
  margin: 0;
}
body {
  overflow: hidden;
  overscroll-behavior: none;
}
`;
