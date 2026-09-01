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

A failure is a class, never assembled at the call site. Each category module declares one
abstract class extending `Failure` that owns the category's `categoryCode`, and every concrete
failure in that module extends it:

```ts
export abstract class TransitFailure extends Failure {
  readonly categoryCode = FailureCategory.Transit;
}

export class NoDeparturesFoundFailure extends TransitFailure {
  readonly nameKey = 'noDeparturesFoundFailureName' as const;
  readonly messageKey = 'noDeparturesFoundFailureMessage' as const;

  constructor() {
    super('no_departures_found');
  }
}
```

The category class is the type a whole category is named by, in a signature and in a
`@returns`/`@throws` tag. `index.ts` re-exports `Failure` itself as the type every store and
repository signature uses. Import from `@/core/failures`, never from a category module.

Exceptions become failures in the repository or before if the failure gets constructed from a non-exception case The repository relays anything already a `Failure` and falls back to rethrowing unknown exceptions.

**Add a failure**

1. Add the class to its category module, extending that module's category class.
2. Add `<name>FailureName` and `<name>FailureMessage` to `i18n/en.ts`.
3. If it is a new category: new module, new abstract category class, add it to
   `FailureCategory` in `failure.ts`.

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
