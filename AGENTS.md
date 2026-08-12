# AGENTS.md

Repository-wide guidance for coding agents.

## Project

Station Reach searches a public transit station, fetches every departure leaving it, and paints
the reachable stops on a map coloured by travel time. One Expo codebase, three targets: iOS,
Android, and the web app at https://station-reach.eu. Data comes from the Transitous (MOTIS)
public REST API — no key, no backend of our own.

The repo is mid-rewrite: Flutter → React Native, in place.

## Hard Rules

- Read the scoped `AGENTS.md` nearest the files being changed:
  - `src/core/AGENTS.md` — theme, i18n, failures, DI, HTTP, shared components.
  - `src/features/map/AGENTS.md` — the map feature and the Transitous API.
- Check `git status` before editing. Do not revert user changes or unrelated local edits.
- Keep changes scoped to the task.
- Attributions and other legal documents and requirements stay visible and reachable.
- Reuse before adding: a theme token, a `core/components` component, a `core/helpers` function.
  Check that one exists before writing another.
- Never hardcode a spacing, radius, colour, duration or layout width — read a token.
- No user-facing string literals. Every one goes through `t()`.
- No `any`, no `!` assertion, no unchecked cast. `strict` and `noUncheckedIndexedAccess` are on.
- Errors are values. Nothing throws across a layer boundary above the data source.
- Never edit or import from `../station_reach_flutter_reference`. Read it to recover behaviour;
  delete a Flutter file only once its behaviour exists in the new code.
- Do not add a test suite (see Verification).
- Prefer `rg` for search.

## Setup

```bash
npm install
npm start            # dev server; press i / a / w
npm run ios          # or: android, web
npm run typecheck    # tsc --noEmit
npm run lint
eas build -p ios     # release builds
```

## Structure

Clean architecture, feature-first. Shared code lives in `src/core`; everything else belongs to
exactly one feature. Import through `@/…` across that boundary, relative paths within a feature.

```
src/
  app/                  expo-router routes — thin, no logic
  core/                 shared: components, failures, helpers, http, i18n,
                        notifications, theme, container.tsx
  features/map/
    data/               datasources (throw), repositories (return Result)
    domain/             models, repository interfaces, usecases
    presentation/       stores, map, screens, components
  types/                ambient declarations
```

`@/*` → `src/*` and `@/assets/*` → `assets/*`, both from `tsconfig.json`.

## Architecture

The dependency arrow is `presentation → domain ← data`. Domain imports nothing from the other
two, and nothing from React, Expo or the HTTP client.

`Component → Store → Use case → repository interface → repository impl → data source`. Never
skip a step: a store calls a use case, never a repository or a data source.

| Layer | Job | On failure |
| --- | --- | --- |
| Data source | network, and wire JSON → domain models; the only place wire shapes exist | throws |
| Repository | catches, maps every exception to a `Failure` | returns `ResultAsync` |
| Use case | one operation, combines repositories, applies business rules | returns `ResultAsync` |
| Store | calls the use case, unwraps, sets state | folds into a `failure` state |
| Component | reads store state and renders | — |

Everything is a factory taking its dependencies as arguments. `src/core/container.tsx` builds the
one graph and `ContainerProvider` hands it down. No module-level singletons, and never import a
dependency at the point of use.

## Change workflows

**Add a use case** — `domain/usecases/<name>.ts`: export a function-type alias and
`create<Name>(deps): <Name>`. Depend on repository interfaces only, return
`ResultAsync<T, Failure>`, document its `Failures:`, register in `container.tsx` under `Domain`.

**Add a store** — `presentation/stores/<name>-store.ts`: export `<Name>State` (a union on
`status`), `<Name>Store`, and `create<Name>Store(useCases): StoreApi<<Name>Store>`. Keep
per-instance bookkeeping in the factory closure, register under `Presentation`, and add the
selector hook to the feature's `use-*-stores.ts`.

**Add a screen part** — `_name.tsx` beside the parent's `index.tsx`, imported only by it. It
subscribes to the state it renders rather than taking props threaded down. Once it grows parts
of its own it becomes a folder with its own `index.tsx`.

**Add a failure** — see `src/core/AGENTS.md`.

Each ends the same way: `npm run typecheck`, `npm run lint`, then exercise the screen.

## Style

- Prettier: `singleQuote`, `printWidth: 80`, `trailingComma: es5`. ESLint is correctness only.
- Files `kebab-case.ts`/`.tsx`. Components `PascalCase`, factories `createX`, hooks `useX`,
  module constants `SCREAMING_SNAKE`.
- A module with private parts is a folder: `index.tsx` plus `_name.tsx` siblings, imported only
  by that parent.
- A constant two components share is a token, not an export from whichever needed it first.
- Object parameters beyond two arguments. No positional booleans.
- Explicit return types on exported functions. `readonly` on interface fields and array props.
- `as const satisfies X` for constant tables — it checks the shape and keeps the literal types.

## Documentation

- TSDoc every exported symbol: a one-line summary, then only the sections it actually has, in
  this order — `Parameters:` (`- name: description`), `Returns:`, `Failures:`, `Throws:`. Use
  `{@link X}` in prose. No `@param` / `@returns` tags.
- `Failures:` names concrete constants. Document behaviour at the layer that owns it: repository
  behaviour on the domain interface, the implementation only where it differs.
- Skip the doc where the name and signature already say it — pass-throughs, plain value types,
  obvious fields.
- Open questions are a `To-Do:` block at the top of the file with `- [ ]` items.

## Comments

Closed by default. Two kinds are allowed and nothing else:

1. TSDoc on an exported symbol, as above.
2. An inline comment where the behaviour is genuinely surprising — a platform trap, a
   workaround, a gesture, an upstream API constraint. That reasoning belongs here, next to the
   code, and not in an AGENTS.md.

Do not narrate what the code does, justify an ordinary choice, explain a name or a token, or head
a module whose contents are self-evident. If the reason for a comment is "so a reader knows what
this is", delete it.

## Writing

Applies to docs, plans, commit messages, PRs and chat answers alike.

- One claim per sentence. Cut any sentence that only sets up the next one.
- A table, not prose, for anything that is a mapping.
- No preamble, no restating the request, no closing summary that repeats the diff.
- No "comprehensive", "robust", "seamless", and no praise for the work.
- A plan is numbered steps with paths. Reasoning goes in one context section, once.

## Verification

Narrowest check first, then broaden.

```bash
npm run typecheck
npm run lint
```

- Clean type and lint output is the floor, not the proof. Exercise the affected screen on web
  **and** a native target; the platforms fail differently and neither substitutes for the other.
- There is no test suite and that is deliberate. Do not add one without being asked.
- If you could not run a check, say which one and why. Never claim a result you have not seen.

## Git

- Conventional Commits: lowercase, imperative, one concern each, no scope —
  `fix: give search result rows a full touch target`.
- Types in use: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`, `style`, `ci`.
- A version bump is its own `chore:` commit and moves `package.json` and `app.json` together.
- Split unrelated edits into separate commits even when they were made in one sitting.
- Branches are `kind/subject`, e.g. `rewrite/react-native`.
- Commit or push only when asked.

## Security and privacy

- Never commit a keystore, an EAS credential or an App Store Connect key.
- The app collects nothing. Do not log or transmit a search query or a coordinate.
- Adding a network destination is a privacy-policy change, not an implementation detail.

## Agent orchestration

- Decide whether delegating is warranted before doing it; most single-file changes are not.
- Delegate a read-only agent when the scope is unknown, when behaviour has to be recovered from
  the Flutter reference, or when a change crosses layers.
- The main agent owns synthesis, edits and verification. A subagent reports files, lines and
  risks; it does not decide.
- Never run agents in parallel over the same files.

## AGENTS.md maintenance

- Read the section you are changing, and any scoped file that extends it, first.
- Replace stale guidance. Never append a second rule for the same concern.
- Do not restate what the code or a config already records — no file inventories, no token
  values, no identifiers, no project trivia. An agent can read `ls` and `app.json`. Rules only.
- Keep rules short, imperative and checkable in review.
- Prefer a general rule to one written for a single incident.
- A rule belongs here only if it survives the next refactor. Reasoning about one workaround
  belongs in a comment beside that code.
- Name a file as a canonical example only when it is the pattern to copy.
