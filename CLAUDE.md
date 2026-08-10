# Station Reach

Search a public transit station, fetch every departure leaving it, and paint all reachable stops on a map coloured by travel time. One codebase, three targets: iOS, Android, and the web app at https://station-reach.eu.

> **This repo is mid-rewrite: Flutter → React Native, in place.** The original Flutter source is kept read-only at `../station_reach_flutter_reference`. Read it to recover behaviour and intent; never edit it, never import from it. Delete a Flutter file only once its behaviour exists in the new code.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | Expo (managed) + expo-router |
| Language | TypeScript, `strict: true`, no `any` |
| Targets | iOS, Android, Web (react-native-web) |
| State | Zustand — one store per concern, built by a factory and provided through the container |
| Animation | `react-native-reanimated` + `react-native-gesture-handler` for anything a finger drives; the classic `Animated` API elsewhere |
| Errors | `neverthrow` — `Result<T, Failure>`, never thrown across a layer boundary |
| Map | MapLibre: `@maplibre/maplibre-react-native` (native) + `maplibre-gl` (web), behind one wrapper module |
| Data | Transitous (MOTIS) public REST API. No key, no backend of our own. |

These identifiers are load-bearing — the live store listings depend on them:

- iOS bundle id `eu.antons-webfabrik.station-reach` (App Store id `6752408029`)
- Android application id `eu.antons_webfabrik.station_reach`

## Setup commands

```bash
npm install
npx expo start            # dev server; press i / a / w
npx expo start --web      # web only
npx tsc --noEmit          # typecheck — run before calling anything done
npx expo lint
eas build -p ios          # release builds
```

## Project structure

Clean architecture, feature-first. Everything shared lives in `core/`; everything else belongs to exactly one feature.

```
app/                            # expo-router routes — thin, no logic
src/
  core/
    components/                 # cross-feature UI (FadeGestureDetector, IconButton, …)
    failures/                   # failure constants + category unions, index.ts unions them
    helpers/                    # pure functions (colour interpolation, icon mapping)
    http/                       # client + User-Agent, HttpError → Failure mapping
    i18n/                       # locale dictionaries
    notifications/              # the one global notification store + its hook
    theme/                      # design tokens + useTheme()
    container.tsx               # the whole dependency graph + ContainerProvider
  features/map/
    data/
      datasources/              # raw Transitous calls — throws
      repositories/             # catches, returns Result
    domain/
      models/ enums/            # plain types, zero framework imports
      repositories/             # interfaces the data layer implements
      usecases/                 # orchestration, one class/function per use case
    presentation/
      stores/                   # Zustand stores
      screens/                  # screen + its private parts
      components/               # feature-scoped UI
```

A screen or compound component is a folder: `index.tsx` is the public entry, and `_underscore-prefixed.tsx` siblings are its private parts, imported only by that parent. This replaces Dart's `part` files — keep the discipline, one component per file.

Files are `kebab-case.ts`; React components are `PascalCase` inside them.

## Architecture rules

The dependency arrow is `presentation → domain ← data`. Domain imports nothing from the other two, and nothing from React, Expo, or the HTTP client.

Each layer has exactly one job:

- **Data source** — talks to the network, parses JSON into domain models, **throws** on failure. It is the only place raw API shapes exist.
- **Repository** — catches, converts every exception into a `Failure`, returns `Result<T, Failure>`. Never leaks a transport error upward.
- **Use case** — one operation, combines repositories, applies business rules. No UI, no HTTP.
- **Store** — calls the use case, unwraps the `Result`, sets state. Never calls a repository or data source directly.
- **Component** — reads store state and renders. No fetching, no business logic.

Errors are values, not exceptions. A failure carries `{ code, categoryCode, nameKey, messageKey }` and is defined as a concrete constant, never assembled at the call site. It holds *translation keys*, never copy — nothing between the data layer and the notification that renders it should contain a user-facing sentence:

```ts
export const noDeparturesFoundFailure = {
  code: 'no_departures_found',
  categoryCode: FailureCategory.Transit,
  nameKey: 'noDeparturesFoundFailureName',
  messageKey: 'noDeparturesFoundFailureMessage',
} as const satisfies FailureBase;
```

`as const satisfies FailureBase` is the load-bearing part: it checks the shape while keeping `code` and `categoryCode` as literal types. `Failure` — the type everything is written against — is the *union* of every concrete failure, so both fields act as discriminants and give back what the Dart class hierarchy provided:

```ts
if (failure.code === noDeparturesFoundFailure.code) {
  // narrowed to TransitFailure — the concrete "class"
}

if (failure.categoryCode === FailureCategory.Networking) {
  // narrowed to NetworkingFailure — the "parent class"
}
```

Each category module exports its constants plus a union named after the category (`NetworkingFailure`, `TransitFailure`); `core/failures/index.ts` unions those into `Failure`. Import everything from `@/core/failures`, never from the individual modules. Every function that can fail lists its possible failures in its doc comment.

Dependencies are passed in, never imported at the point of use. `src/core/container.ts` builds the whole graph in one function, grouped `Data / Domain / Presentation`, and `ContainerProvider` hands it to the tree — the same job `MultiBlocProvider` did. Stores are *factories* that take their use cases as arguments; a store never imports the container, and the selector hooks that bridge the two live beside them (`use-map-stores.ts`, `use-in-app-notification-store.ts`). Nothing in the app reaches for a module-level singleton.

## State management

One Zustand store per concern, each small and single-purpose. Every one is a `createXStore(deps)` factory over `zustand/vanilla` — never a module-level `create()` — so its dependencies arrive as arguments and any per-instance bookkeeping (abort controllers, request ids, timers) lives in the factory closure rather than in module scope. The four the app needs, ported straight from the Flutter cubits:

| Store | Owns |
| --- | --- |
| `stationSearch` | query results — `initial \| loading \| loaded \| failure` |
| `stationDepartures` | the fetched reachability set for one station |
| `stationSelection` | which stop on the map is selected + its departures |
| `departureSelection` | which departure's itinerary is open |

State is a discriminated union on `status`, never a bag of optional fields plus loose booleans:

```ts
type StationSearchState =
  | { status: 'initial' }
  | { status: 'loading'; stations: Station[] }   // keeps previous results visible
  | { status: 'loaded'; stations: Station[] }
  | { status: 'failure'; failure: Failure };
```

Name states `<Feature><Status>` consistently — the Flutter code drifted between `StationSearchStateLoading` and `StationDeparturesLoading`; don't carry that inconsistency over.

Failures surface to the user through one global in-app notification store, subscribed to once at the root. Screens do not render their own error banners.

## Theme

There is no `webfabrik_theme` on this side of the port — its tokens are reimplemented in `src/core/theme`, and the widgets it supplied (modal sheet, list item, dotted timeline, dot, small icon button, gaps) are reimplemented in `src/core/components`. Never hardcode a spacing, radius, colour, or duration; always read a token.

```
spacing   tiny 1 · xTiny 2 · small 4 · xSmall 8 · xxSmall 12 · medium 14
          xMedium 24 · xxMedium 32 · large 44 · xLarge 55 · xxLarge 128
radii     small 8 · field 10 · medium 12 · button 14 · xMedium 18 · large 20 · xLarge 30
durations tiny 50 · xTiny 100 · xxTiny 150 · short 200 · xShort 250 …  (ms)
```

Inter ships as a single variable TTF and is loaded in the root layout; **nothing renders until it resolves**, because the fallback is a serif face and swapping it in after first paint reflows every label on the map.

Brand colours: primary `rgb(83,196,108)`, accent `rgb(7,114,255)`. `timelineGradient` is the 8-stop travel-time ramp (green → yellow → orange → red) and is the app's single most important visual; `secondaryGradient` (purple → cyan) tints departure list icons by index.

The look is iOS-flavoured: translucent blurred surfaces over the map, the Inter variable font with explicit weight axes, generous rounding. Prefer a `<Gap size="small" />` component over ad-hoc margins, matching the Flutter `SmallGap()` widgets.

Responsive breakpoint is **900px**. Below it the modal is bottom-centred and the legends live inside it; at or above it the modal is bottom-right and the legends sit bottom-left. Search field and modal are both capped at 400px wide.

## Localization

Every user-facing string goes through the i18n dictionary — no literals in components, even for a single locale. English is the only locale today; the keys already exist in `../station_reach_flutter_reference/lib/core/l10n/app_en.arb`.

## Transitous API

Base `https://api.transitous.org`. It is a free community service — be a good citizen: no polling, no retry storms, and always send

```
User-Agent: station_reach/<version> (mailto:anton@antons-webfabrik.eu)
```

Browsers forbid setting `User-Agent`, so on web this header silently drops. Do not attempt to work around it.

**Search** — `GET /api/v1/geocode?text=<query>&type=STOP`. The station's display area is the `areas[]` entry with the highest `adminLevel` ≤ 7.

**Departures** — `GET /api/v5/stoptimes?stopId=&n=&fetchStops=true&radius=200&mode=&withScheduledSkippedStops=true&time=<iso>&pageCursor=`

Two calls per station, one per mode bucket, and they are independent — run them concurrently:

- long distance (`COACH`, `HIGHSPEED_RAIL`, `LONG_DISTANCE`, `NIGHT_RAIL`) with `n=1000`
- regional (tram, subway, suburban, bus, regional rail, cable car, funicular, metro, …) with `n=400`

Union the results, drop departures whose stop lists are deeply equal to one already kept, then sort by name and, within a name, by final-stop duration. If both buckets fail, propagate the failure; if only one fails, use the other.

**Known MOTIS bug — keep the workaround.** The API can answer `{"error": "Departure is last stop in trip"}`. Handle it by re-requesting with `time` advanced by one hour, up to 10 times, dropping the page cursor. A missing or empty `nextPageCursor` means there is genuinely nothing to show → `noDeparturesFound`. This logic is subtle and was hard-won; port it from `map_remote_data_source.dart` rather than rederiving it.

Each stop's `duration` is `scheduledArrival - scheduledDeparture` of the origin, so the origin stop is always duration zero.

## Map behaviour

- Basemap: the CARTO Voyager **vector** style, `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`. Same vendor and attribution as the Flutter app's raster tiles, but a raster style carries no glyphs and MapLibre cannot draw station labels without them.
- Initial camera `42.68, 10.127` at zoom 4, min zoom 1.5. On load, move to `(station.lat - 1, station.lon)` at zoom 6 so the modal doesn't cover the origin.
- **Travel-time colour**, used identically by markers, polylines, list rows, and the legend:
  `t = clamp(floor(minutes / 30), 0, 36) / 36` → interpolate `timelineGradient`. That caps at 18h, which is what the legend's `30min · 9h · 18h+` labels mean.
  Markers and polyline segments both use *cumulative* duration from the origin: a leg is coloured by the time at the stop it arrives at, so it always matches the marker at its far end and the trip ramps green → red along its length. A leg's own duration is deliberately not what colours it.
- Reachability is indexed once per loaded station (`buildStopIndex`), keyed by stop id and holding both the fastest arrival and the calling departures. Tapping a marker is a lookup; never walk the departures again.
- A tap resolves to a station by querying a **box** around the point and then taking the **nearest** dot inside it, never the first one the query returns. Both halves are load-bearing: the box is what makes the target bigger than the 6.3px dot, and nearest-wins is what stops a dense area handing back a neighbour by draw order. Point queries are too tight to hit a dot at all — that is why the binding ships a `hitbox` prop. On web the pointer cursor runs off that same box on `mousemove`, never off `mouseenter`/`mouseleave` on the circle layer: those hit-test the drawn dot, so the cursor flickers on its edge and disagrees with where a click actually lands. Dropping back to `grab` is held for `durations.xxTiny` on top of that, because neighbouring boxes stop a few pixels short of touching and sweeping a line of stations blinked the cursor once per gap.
- Native runs two tap paths into that same lookup, and both may fire for one tap. `ShapeSource.onPress` is the authoritative one; a `Gesture.Tap` on a wrapper around the map is an accelerator, because the binding makes its own recogniser wait on the map's double-tap and two-finger-tap recognisers — a third of a second before a selection can even start. Selecting a stop is idempotent (see `station-selection-store`), which is what makes running both safe; don't "clean this up" into one without checking the delay comes back.
- Coordinate spaces differ per binding and per method. `queryRenderedFeaturesInRect` takes `[top, right, bottom, left]`, but iOS needs `top` to be the larger y and Android the smaller, and Android measures in raw pixels where iOS measures in view points. `getCoordinateFromView` converts density itself and takes points on both.
- A station reachable by several departures is drawn once, at its **shortest** duration.
- Station name labels collide out through MapLibre's own symbol placement (`textAllowOverlap: false`, `textOptional: true`). The Flutter app ran supercluster by hand on every move/rotate/zoom end; that is gone, and should stay gone.
- Overlapping trip lines are fanned apart by a per-trip index offset that scales with zoom, so parallel routes stay distinguishable. This is deliberate; don't "fix" it into overlapping lines.
- Marker hit areas are much larger than the visible dot: a 6.3px circle inside a `STATION_HIT_RADIUS` query box. Preserve that on touch. The old transparent-stroke trick for widening it is gone — it inflated the target on web into overlapping rings that returned the wrong station.

## Testing

The app carries no tests, and that is deliberate — it is one screen over one read-only API, and the interesting parts are all reachable in a few seconds of clicking. Don't add a test suite without being asked.

Before saying a change works: `npx tsc --noEmit` clean, `npx eslint .` clean, and the affected screen exercised on both a native target and web.

## Conventions

- **Prettier**: `singleQuote: true`, `printWidth: 80` — the same shape the Dart analyzer enforced.
- Named/object parameters for anything with more than one argument. No positional booleans.
- Prefer explicit types on exported functions and non-obvious locals; let inference handle the trivial ones.
- Doc-comment every exported symbol with TSDoc, using the structure the Flutter code used:

  ```ts
  /**
   * Gets the departures reachable from a station.
   *
   * Parameters:
   * - station: the origin station
   *
   * Returns:
   * - the deduplicated, sorted departures
   *
   * Failures:
   * - noDeparturesFound
   * - any networking failure
   */
  ```

- Open-question markers stay as a `To-Do:` block comment at the top of the file, with `- [ ]` items.
- **Commits: Conventional Commits**, lowercase, one concern each — `feat:`, `fix:`, `chore:`, `docs:`, `style:`. Version bumps are their own `chore:` commit.

## Do not change

- **Attribution is a licensing obligation.** OpenStreetMap, CARTO, Transitous, and the Transitous data sources must stay reachable and linked, alongside the privacy policy and Impressum. The info button and the dialog behind it are not optional UI.
- The bundle/application identifiers and App Store id above.
- The MIT licence and the OSS repository link in the attribution dialog.

## Web gotchas

All of these cost real debugging time; none of them fail loudly.

- **`pointerEvents: 'box-none'` survives only a *registered* style on React Native Web.** RNW polyfills the value while compiling a `StyleSheet.create` style — emitting the paired `.container > * { pointer-events: auto }` rule — and drops it from an inline object, since no such CSS value exists. Always take it from `core/components/pointer-events.ts`. Do *not* "fix" it by writing `'none'` on the container and `'auto'` on the panel: that works only on the web, where the value is merely inherited. On a device `'none'` sets `userInteractionEnabled = NO` on the whole subtree and a child cannot opt back in, which silently kills the search field, the sheet drag and the attribution button.
- **`translateX`/`translateY` must be numbers**, not percentage strings. The native animation driver ignores percentages, so a pager animates on web and sits still on device. Measure with `onLayout` instead.
- `useNativeDriver` is unavailable on web; read it from `USE_NATIVE_DRIVER` rather than hardcoding `true`.
- The root document needs explicit `height: 100%` (see `src/app/+html.tsx`). Without it the whole tree collapses to zero height and the map renders as a 400×300 stub.
- **An animated `opacity` or `transform` silently kills the blur beneath it.** Both make their element a backdrop root, and a backdrop root has nothing behind it to blur, so any `TranslucentSurface` inside one renders flat. Fading or sliding a blurred panel therefore has to end with those properties *removed*, not merely set to `1` / `translateY(0)` — see `InAppNotificationListener`, and the legend fade in `DraggableModal` that starts its range exactly at the resting height for the same reason.
- **Animating a layout property (`height`, `maxHeight`) inside the search card does not work on web.** Neither `Animated` nor Reanimated moves it: the inline style is written and the computed height stays `0`. `onLayout` is dead in that subtree too, so the content cannot be measured to animate towards. Anything that needs to grow or shrink there has to be sized by a constant, or the card restructured first — don't assume it will just work because it works on native.

## Native gotchas

These are the mirror image of the web ones: they look fine in the browser and fail on a device.

- **`flex: 1` collapses a self-sizing box.** It means `flexBasis: 0`, and Yoga measures an auto-height parent from its children's flex basis — so a fill child inside a container with no height of its own resolves to nothing. CSS sizes the same tree from its max-content contribution, which is why the web looks right. `TranslucentSurface` uses `flexGrow: 1` for exactly this reason: with `flex: 1` the search card collapsed to its border on iOS while staying correct on web.
- **iOS 26 draws no blur for the light `UIBlurEffect` styles.** Neither the legacy `light` nor `systemUltraThinMaterialLight` blurs anything — the surface keeps its tint and the map stays pin-sharp underneath, which reads as "the blur is broken" rather than as an error. `systemThinMaterialLight` is the thinnest one that still blurs; see `BLUR_TINT`. It stays iOS-only because `tint` also picks the fill under the blur, and the system materials are grey where `light` is white.
- **The font file's name is the font's API.** `useFonts({ myAlias: require(…) })` invents a family on web, but the `expo-font` plugin embeds the file through `UIAppFonts` and CoreText registers it under the family name *inside the TTF* — while Android resolves it from the asset's *file* name. An alias agreeing with neither renders the system serif on both, and only on device. The file is `assets/fonts/Inter.ttf`, the family inside it is `Inter`, and `FONT_FAMILY` is `'Inter'`: keep all three the same string. Only one weight comes out of a variable TTF on iOS, so `fontWeight` above the default is synthesised rather than drawn from the `wght` axis.
- **A blur view that gets *resized* stops blurring — and the sheet resizes one on every frame.** `StyleSheet.absoluteFill` ties the `BlurView` to its parent, so the modal's Reanimated height animation resized it; the surface then kept its tint with the map sharp underneath, looking exactly like the tint bug above. Web is unaffected, and the failure survives a cold launch, so it is not a fast-refresh artefact either. `TranslucentSurface` sizes the blur from the window instead and lets the clipping wrapper cut it down — never give it a size that something else animates.

## Still open

- `TransitMode` enumerates modes the app can't show (car, airplane, flex, …). Trim to what Transitous actually returns for stops.
- Android has never been run at all. `BlurView` there defaults to `blurMethod: 'none'`, so every `TranslucentSurface` will render as a flat tint until one is chosen.
