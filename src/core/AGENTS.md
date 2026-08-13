# AGENTS.md — core

Everything shared across features. Extends the root `AGENTS.md`.

## Hard Rules

- No feature knowledge here. Anything that knows about stations, departures or the map belongs
  to `src/features/map`.
- Never hardcode a spacing, radius, colour, duration or layout width — read a token.
- No user-facing string literals. Every one goes through `t()`.
- Failures carry translation keys, never copy.
- No module-level singletons. Stores are factories; `container.tsx` owns the graph.

## Theme

Tokens live in `theme/theme.ts`. Read the values there.

- Read tokens through `useTheme()`. Import a scale directly only where there is no hook context
  (`gap.tsx`).
- `layout` holds the dimensions of the floating chrome. They are tokens because panels that
  never see each other have to agree on them.
- Branch on width through `useIsWideLayout()`, never a hand-measured `useWindowDimensions()`.
- Take `USE_NATIVE_DRIVER` from `theme/animation.ts`; never hardcode `useNativeDriver: true`.
- A new spacing or radius goes into its scale in order, keeping the `tiny → xxLarge` ladder.

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

**Add a failure**

1. Add the constant to its category module, with a one-line doc.
2. Add it to that module's union.
3. Add `<name>FailureName` and `<name>FailureMessage` to `i18n/en.ts`.
4. If it is a new category: new module, new union, and add it to `Failure` in `index.ts`.
5. Name it in the `@returns` of every signature that can now return it.

## Dependency injection

`container.tsx` builds the graph in one function under `// -- Data -- //`, `// -- Domain -- //`
and `// -- Presentation -- //` banners. `Container` holds only `StoreApi<…>` members.
`useContainer()` is the only way to reach it, and it is built once per provider — never at
module scope.

## HTTP

- `getJson` throws `HttpError`. `failure-mapper.ts` is the only place that becomes a `Failure`.
- The User-Agent is set here. Browsers drop it silently; that is expected and not to be worked
  around.

## Components

- Read `components/` before writing a new one; most of what a screen needs is already there.
- Prefer `<Gap size="small" />` over an ad-hoc margin.
- Take pass-through pointer events from `components/pointer-events.ts`. `'none'` is not a
  substitute for `'box-none'`.
- A component with private parts is a folder — see `dialog/` and `draggable-modal/`.

## Cross-platform

One contract, two files: `x.tsx` and `x.web.tsx`, resolved by Metro. Consumers import `'./x'`
and never branch on `Platform` at the call site.

The platform traps are documented in the files where they bite. Read a file's comments before
changing anything animated, blurred, sized or hit-tested.
