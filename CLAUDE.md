# Station Reach

Search a public transit station, fetch every departure leaving it, and paint all reachable stops on a map coloured by travel time. One codebase, three targets: iOS, Android, and the web app at https://station-reach.eu.

> **This repo is mid-rewrite: Flutter → React Native, in place.** The original Flutter source is kept read-only at `../station_reach_flutter_reference`. Read it to recover behaviour and intent; never edit it, never import from it. Delete a Flutter file only once its behaviour exists in the new code.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | Expo (managed) + expo-router |
| Language | TypeScript, `strict: true`, no `any` |
| Targets | iOS, Android, Web (react-native-web) |
| State | Zustand — one store per concern |
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
    failures/                   # Failure hierarchy, category constants
    helpers/                    # pure functions (colour interpolation, icon mapping)
    http/                       # client + User-Agent, DioException → Failure mapping
    i18n/                       # locale dictionaries
    theme/                      # design tokens + useTheme()
    container.ts                # explicit dependency wiring
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

Errors are values, not exceptions. A `Failure` carries `{ name, message, categoryCode, code }` and is defined as a concrete constant, never assembled at the call site:

```ts
export const noDeparturesFound: TransitFailure = {
  name: 'No Departures Found',
  message: 'No departures found for the given station.',
  categoryCode: FailureCategory.Transit,
  code: 'no_departures_found',
};
```

Failures are grouped by category (`networking`, `transit`, `general`, …) with the category codes centralised in one constants module. Every function that can fail lists its possible failures in its doc comment.

Dependencies are passed in, never imported at the point of use. Compose the whole graph in `src/core/container.ts` — one place to read the app's wiring, grouped `Core / Presentation / Domain / Data / Third Party` in that order.

## State management

One Zustand store per concern, each small and single-purpose. The four the app needs, ported straight from the Flutter cubits:

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

- Tiles: CartoDB Voyager, `https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png`, subdomains `a b c`.
- Initial camera `42.68, 10.127` at zoom 4, min zoom 1.5. On load, move to `(station.lat - 1, station.lon)` at zoom 6 so the modal doesn't cover the origin.
- **Travel-time colour**, used identically by markers, polylines, list rows, and the legend:
  `t = clamp(floor(minutes / 30), 0, 28) / 28` → interpolate `timelineGradient`. That caps at 14h, which is what the legend's `30min · 7h · 14h+` labels mean.
  Markers use *cumulative* duration from the origin; polyline segments use the *leg* duration between their two stops.
- A station reachable by several departures is drawn once, at its **shortest** duration.
- Station name labels are clustered (supercluster, radius 70) and recomputed on move/rotate/zoom end — never every frame.
- Overlapping trip lines are fanned apart by a per-trip index offset that scales with zoom, so parallel routes stay distinguishable. This is deliberate; don't "fix" it into overlapping lines.
- Marker hit areas are much larger than the visible dot (6.3px circle, ~26px transparent hit ring). Preserve that on touch.

## Testing

The Flutter app shipped with no tests. Don't cargo-cult that, but don't overcorrect either: cover the domain layer — use cases, the departure dedup/sort, colour interpolation, the MOTIS retry loop, model mapping — with plain unit tests. Skip snapshot and UI tests; they cost more than they catch here.

Before saying a change works: `npx tsc --noEmit` clean, and the affected screen exercised on both a native target and web.

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

Both of these cost real debugging time; neither fails loudly.

- **`pointerEvents: 'box-none'` does not survive `style` on React Native Web** — it computes to `auto`, so a full-screen chrome overlay silently swallows every map click. Use `'none'` on containers and `'auto'` on the panels that need input.
- **`translateX`/`translateY` must be numbers**, not percentage strings. The native animation driver ignores percentages, so a pager animates on web and sits still on device. Measure with `onLayout` instead.
- `useNativeDriver` is unavailable on web; read it from `USE_NATIVE_DRIVER` rather than hardcoding `true`.
- The root document needs explicit `height: 100%` (see `src/app/+html.tsx`). Without it the whole tree collapses to zero height and the map renders as a 400×300 stub.

## Still open

- `TransitMode` enumerates modes the app can't show (car, airplane, flex, …). Trim to what Transitous actually returns for stops.
- Never run on a real iOS or Android device — only web and the simulator toolchain. `expo prebuild` plus a native build is the next step, and MapLibre native is the likeliest thing to need attention.
