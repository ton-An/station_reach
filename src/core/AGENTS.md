# AGENTS.md — core

Everything shared across features. Extends the root `AGENTS.md`.

## Hard Rules

- No feature knowledge here. Anything that knows about stations, departures or the map belongs
  to `src/features/map`.
- Failures carry translation keys, never copy.

## Theme

Tokens live in `theme/theme.ts`. Read the values there.

- Read tokens through `useTheme()`. Import a scale directly only where there is no hook context
  (`gap.tsx`).
- `layout` holds the dimensions of the floating chrome. They are tokens because panels that
  never see each other have to agree on them.
- Branch on width through `useIsWideLayout()`, never a hand-measured `useWindowDimensions()`.
- Animate with Reanimated shared values, never React Native's `Animated`. The legacy API falls
  back to the JS thread on web, which is where the app is slowest.
- A gesture settles with `withSpring`, a state change with `withTiming`.
- A new spacing or radius goes into its scale in order, keeping the `tiny → xxLarge` ladder.
  Never add two tokens with the same value, and never compose one from two others at a call
  site — add the rung instead.
- Icon sizes come from `icons`. An `Icon` never takes a literal `size`.
- A floating panel takes `radii.xMedium`; the sheet's top edge takes `radii.xLarge`.

## i18n

- `i18n/en.ts` is the dictionary: one `as const` object, camelCase keys, `// -- Section -- //`
  banners. `TranslationKey` is derived from it.
- Read with `t('key')` — a plain call, not a hook.
- Failure keys are `<name>FailureName` and `<name>FailureMessage`.
- English is the only locale. Keys not yet ported are in the Flutter reference at
  `lib/core/l10n/app_en.arb`.
- Anything calling `t` at module scope freezes at import time. Hold keys and resolve at render —
  see `attributions.ts`.

## Failures

A failure is a concrete constant, never assembled at the call site:

```ts
export const noDeparturesFoundFailure = {
  code: 'no_departures_found',
  categoryCode: FailureCategory.Transit,
  nameKey: 'noDeparturesFoundFailureName',
  messageKey: 'noDeparturesFoundFailureMessage',
} as const satisfies FailureBase;
```

`as const satisfies FailureBase` is load-bearing: it checks the shape while keeping `code` and
`categoryCode` literal, so both narrow `Failure` — `code` to the concrete failure,
`categoryCode` to its category. `Failure` is the union of every constant, not an open interface.

Each category module exports its constants plus a union named after the category. `index.ts`
unions those into `Failure`. Import from `@/core/failures`, never from a category module.

Exceptions become failures on one path: a data source that already knows which failure it hit
throws `FailureError`, the repository unwraps it, and `failure-mapper.ts` maps everything else
through `mapHttpError`.

**Add a failure**

1. Add the constant to its category module.
2. Add it to that module's union.
3. Add `<name>FailureName` and `<name>FailureMessage` to `i18n/en.ts`.
4. If it is a new category: new module, new union, and add it to `Failure` in `index.ts`.

## Dependency injection

`container.tsx` builds the graph in one function under `// -- Data -- //`, `// -- Domain -- //`
and `// -- Presentation -- //` banners. `Container` holds only `StoreApi<…>` members, reached
through `useContainer()`.

## Components

- Prefer `<Gap size="small" />` over an ad-hoc margin.
- Take pass-through pointer events from `components/pointer-events.ts`. `'none'` is not a
  substitute for `'box-none'`.
- `dialog/` and `draggable-modal/` are the folder-with-private-parts pattern to copy.

## Cross-platform

One contract, two files: `x.tsx` and `x.web.tsx`, resolved by Metro. Consumers import `'./x'`
and never branch on `Platform` at the call site.

The platform traps are documented in the files where they bite. Read a file's comments before
changing anything animated, blurred, sized or hit-tested.
