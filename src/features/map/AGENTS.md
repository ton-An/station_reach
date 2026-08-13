# AGENTS.md — map feature

The app's one feature. Extends the root `AGENTS.md`.

## Hard Rules

- Wire shapes live only in `data/datasources/transitous-types.ts`. Nothing above
  `transitous-mappers.ts` sees an API field name.
- Transitous is a free community service: no polling, no retry loops, no request storms.

## Canonical files

Copy these when adding code of the same kind.

| Role | File |
| --- | --- |
| Data source, throws | `data/datasources/map-remote-data-source.ts` |
| Wire → domain mapping | `data/datasources/transitous-mappers.ts` |
| Repository implementation | `data/repositories/map-repository-impl.ts` |
| Repository contract | `domain/repositories/map-repository.ts` |
| Use case, thin | `domain/usecases/search-stations.ts` |
| Use case, with logic | `domain/usecases/get-station-departures.ts` |
| Store factory | `presentation/stores/station-search-store.ts` |
| Selector hooks | `presentation/stores/use-map-stores.ts` |
| Screen with private parts | `presentation/screens/map-screen/` |
| Platform contract | `presentation/map/map-view.types.ts` |

## Stores

Stores are `zustand/vanilla`; the hooks in `use-map-stores.ts` bridge through `useContainer()`.

Failures reach the user through the one global in-app notification store, subscribed once at the
root. Screens do not render their own error banners.

## Transitous API

**Search** — `GET /api/v1/geocode`. A station's display area is the `areas[]` entry with the
highest `adminLevel` ≤ 7.

**Departures** — `GET /api/v6/stoptimes`, two calls per station, one per mode bucket, run
concurrently.

- **Both buckets are required.** If either fails to fetch, the whole load fails. There is no
  partial result.
- `noDeparturesFound` is the one exception: it is an answer, not a failed fetch, so the other
  bucket is then used alone. It propagates only when neither bucket has anything.
- **Dedupe before sorting.** Dedupe keeps the first occurrence and long distance is concatenated
  first, so a trip published under both names keeps its long-distance one. Then sort by name,
  and within a name by final-stop duration.
- One request per bucket, no paging. A missing or empty `nextPageCursor` means the station has
  nothing → `noDeparturesFound`.
- A stop's `duration` is measured from the origin's scheduled departure, so the origin is zero.

## Map

`map-view.tsx` renders MapLibre Native, `map-view.web.tsx` MapLibre GL JS, both against
`map-view.types.ts`.

- Constants, ids and style expressions live in `map-config.ts`.
- Reachability is indexed once per loaded station by `buildStopIndex`. Tapping a marker is a
  lookup; never walk the departures again.
- Travel-time colour comes from `colorForDuration` and is identical across markers, polylines,
  list rows and the legend.
- A station reachable by several departures is drawn once, at its shortest duration.
