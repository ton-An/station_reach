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
  - `src/core/AGENTS.md` — theme, i18n, failures, DI, shared components.
  - `src/features/map/AGENTS.md` — the map feature and the Transitous API.
- Check `git status` before editing. Do not revert user changes or unrelated local edits.
- Keep changes scoped to the task.
- Attributions and other legal documents and requirements stay visible and reachable.
- Reuse before adding. Look for an existing token, component or helper before writing another.
- Never hardcode what a token or `t()` already owns — a spacing, radius, colour, duration,
  layout width, or any user-facing string.
- No `any`, no `!` assertion, no unchecked cast. `strict` and `noUncheckedIndexedAccess` are on.
- No prop drilling. A component that renders store state subscribes to it; never thread a value
  through a component that does not use it.
- Errors are values. An error the app handles crosses a layer boundary as a `Failure`, never as
  a throw.
- Never edit or import from `../station_reach_flutter_reference`. Read it to recover behaviour;
  delete a Flutter file only once its behaviour exists in the new code.
- Do not add a test suite.

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
    data/               datasources, repositories
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
| Data source | network, and API JSON → domain models; the only place response shapes exist | throws |
| Repository | catches, maps every exception to a `Failure` | returns `Promise<Result>` |
| Use case | one operation, combines repositories, applies business rules | returns `Promise<Result>` |
| Store | calls the use case, unwraps, sets state | folds into a `failure` state |
| Component | reads store state and renders | — |

A data source and a repository is a class taking its dependencies in the constructor. A use case
and a store is a factory taking them as arguments. `src/core/container.tsx` builds the one graph
and `ContainerProvider` hands it down. No module-level singletons, and never import a dependency
at the point of use.

## Change workflows

**Add a use case** — `domain/usecases/<name>.ts`: export a function-type alias and
`create<Name>(deps): <Name>`. Depend on repository interfaces only, and register in
`container.tsx` under `Domain`.

**Add a store** — `presentation/stores/<name>-store.ts`: export `<Name>State` (a union on
`status`), `<Name>Store`, and `create<Name>Store(useCases): StoreApi<<Name>Store>`. State holds
what the UI renders. A non-reactive value, such as a request id, lives in the factory closure
instead, where changing it notifies no subscriber. Register under `Presentation` and add the
selector hook to the feature's `use-*-stores.ts`.

**Add a screen part** — `_name.tsx` beside the parent's `index.tsx`, imported only by it. Once
it grows parts of its own it becomes a folder with its own `index.tsx`.

**Add a failure** — see `src/core/AGENTS.md`.

## Style

- Prettier: `singleQuote`, `printWidth: 80`, `trailingComma: es5`.
- Files `kebab-case.ts`/`.tsx`. Components `PascalCase`, factories `createX`, hooks `useX`,
  module constants `SCREAMING_SNAKE`.
- A sub-component's name starts with its parent's key noun, and its file is the kebab-case of
  that name — `draggable-modal/_modal-header.tsx` exports `ModalHeader`, never `Header`. Take
  the noun, not the parent's full name: `AttributionOpenSourceCard`, not
  `AttributionLegendOpenSourceCard`.
- Keep a function short and single-purpose. One that needs a comment to mark its sections is
  two functions.
- A constant two components share is a token, not an export from whichever needed it first.
- Object parameters beyond two arguments. No positional booleans.
- Explicit return types on exported functions. `readonly` on interface fields and array props.
- `as const satisfies X` for constant tables — it checks the shape and keeps the literal types.

## Documentation

- Write docs only when they add information a reader cannot get from the name, type, initializer
  or surrounding pattern.
- Exported symbols that define behaviour or an architectural contract get a TSDoc comment
  (`/** … */`). That usually means stores, use cases, repository and data source interfaces,
  shared components with interaction or state behaviour, and functions with non-obvious effects.
- Skip docs for plain value types, union members, pass-throughs, obvious fields, when you are restating your thoughts and re-exports
  whose purpose is fully expressed by the code.
- Do not replace useful detailed docs with shorter summaries. Preserve existing explanations
  unless they are wrong, and improve them in place when needed.
- Repository and data source behaviour is documented on the interface. Implementations add docs
  only for differing or non-obvious behaviour.
- Document each API at its own abstraction level. Describe caller-visible behaviour, inputs,
  outputs and guarantees; leave lower-level implementation mechanisms to the layer that owns them
  unless they are part of the contract. Document our code, never a dependency's behaviour.
- Name the concrete failure constants a call can return in `@returns`, and the error types it
  throws in `@throws`. Do not write a vague bullet like "any failure returned by …".
- Module-private code gets docs only for non-obvious behaviour: workarounds, gestures,
  animations, or platform and upstream API constraints.
- When touching undocumented existing code, document only the changed API when the change
  introduces or clarifies a meaningful contract. Do not mass-document nearby code.
- Avoid comments that restate implementation.
- Use `{@link X}` to point at another symbol.
- Open questions are a `To-Do:` block at the top of the file with `- [ ]` items.

Use the TSDoc tag where one exists, in this order: `@param`, `@returns`, `@throws`. Format a
parameter as `@param name - description`. For a contract no tag covers — the states a store moves
through, the parts a screen is built from — use a labelled section with one bullet per entry:
`States:`, `Sub-components:`. Prefer a labelled section over unlabelled prose for those topics.

Before documentation work, read the canonical examples for that kind of file and the docs already
in the target file, and match their level of detail. The register to write in is the one in
`../station_reach_flutter_reference`.

## Writing

Applies to docs, comments, plans, commit messages, PRs and chat answers alike.

- Read `.claude/skills/asd-ste100/SKILL.md` and apply it to every piece of prose before it ships.
  The rules below win where the two differ.
- One claim per sentence. Cut any sentence that only sets up the next one.
- A table, not prose, for anything that is a mapping.
- No preamble, no restating the request, no closing summary that repeats the diff.
- Answer at the length asked for; with none given, the fewest sentences that are complete.
- No "comprehensive", "robust", "seamless", and no praise for the work.
- Name a thing what the library, the platform or the team already calls it. Never coin a term.
- A plan is numbered steps with paths. Reasoning goes in one context section, once.

## Verification

Narrowest check first, then broaden: `npm run typecheck`, then `npm run lint`, then exercise the
screen.

- Clean type and lint output is the floor, not the proof. Exercise the affected screen on web
  **and** a native target; the platforms fail differently and neither substitutes for the other.
- If you could not run a check, say which one and why. Never claim a result you have not seen.

## Git

- Conventional Commits: lowercase, imperative, one concern each, no scope —
  `fix: give search result rows a full touch target`.
- Types in use: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`, `style`, `ci`.
- A version bump is its own `chore:` commit and moves `package.json` and `app.json` together.
- Split unrelated edits into separate commits even when they were made in one sitting.
- Branches are `kind/subject`.
- Commit or push only when asked.

## Agent orchestration

- Decide whether delegating is warranted before doing it; most single-file changes are not.
- Delegate when the scope is unknown or when a change crosses layers.
- Give a subagent one scoped job — explore, edit or check a named part — and have it report
  back the files, lines and risks. The main agent owns the decision and the final verification.

## AGENTS.md maintenance

- Read the section you are changing, and any scoped file that extends it, first.
- Replace stale guidance. Never append a second rule for the same concern.
- Do not restate what the code or a config already records — no file inventories, no token
  values, no identifiers, no project trivia. An agent can read `ls` and `app.json`. Rules only.
- Keep rules short, imperative, non-duplicative and checkable in review.
- Prefer a general rule to one written for a single incident.
- A rule belongs here only if it survives the next refactor. Reasoning about one workaround
  belongs in a comment beside that code.
- Name a file as a canonical example only when it is the pattern to copy.
