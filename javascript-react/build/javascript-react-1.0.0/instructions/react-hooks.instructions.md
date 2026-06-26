---
description: Rules of Hooks and safe effect/state usage in React.
applyTo: '**/*.{jsx,tsx}'
---

# React Hooks

> **Scope:** governed by `.apm/project-mode`. In `advisory` mode, apply these rules only to files you create or are explicitly asked to modify. In `strict` mode, apply to every file.

- Call hooks only at the top level; never inside conditions, loops, or nested functions.
- Call hooks only from components or other hooks.
- Provide complete and accurate dependency arrays for `useEffect`, `useMemo`, and `useCallback`.
- Clean up subscriptions, timers, and listeners in the effect's cleanup function.
- Update state immutably; never mutate state objects or arrays in place.
- Extract reusable stateful logic into custom `use*` hooks.
