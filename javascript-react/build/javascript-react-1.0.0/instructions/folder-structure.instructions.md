---
applyTo: 'src/**'
---

# Folder Structure

> **Scope:** governed by `.apm/project-mode.json`.
>
> - **`strict`** — enforce this structure across the entire `src/` tree.
> - **`advisory`** — this instruction is **opt-in**. Only apply it if the project already uses feature-based architecture (i.e. a `src/features/` directory exists) or the developer explicitly asks to follow this structure. If the project has a different folder layout, do not flag it and do not attempt to reshape it.

## Structure

```
src/
├── app/          # bootstrap only: providers/ router/ [store/] [styles/]
├── features/     # domain features — start all work here
├── components/   # promoted shared UI (second feature needs it)
├── layouts/      # promoted shared layouts (second layout needs it)
├── hooks/        # promoted shared hooks
├── services/     # promoted shared API services
├── types/        # promoted shared types
├── utils/        # promoted shared utils
├── assets/
└── main.tsx
```

**Feature shape** — only create sub-folders needed:

```
features/<name>/
├── components/  hooks/  services/  types/  pages/
├── routes.ts    # exports RouteObject[] — assembled by app/router/, never defined there
└── index.ts     # ONLY public API; all cross-feature imports must use this
```

## Folder-per-Unit Pattern

Every component, page, layout, hook, and util lives in its own named folder — no exceptions. Applies identically everywhere.

```
Button/                          useCounter/        formatDate/
├── Button.tsx                   ├── useCounter.ts   ├── formatDate.ts
├── Button.module.css            └── useCounter.test.ts  └── formatDate.test.ts
├── Button.test.tsx
├── Button.types.ts              # private only; shared types → types/
├── Button.stories.tsx           # only if Storybook installed
└── components/                  # ONE level max; private subcomponents only
    └── ButtonIcon/
        ├── ButtonIcon.tsx
        └── ButtonIcon.test.tsx
```

## Rules

| Concern             | Rule                                                                                                                                                                                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Before creating** | Search `src/components/`, `src/hooks/`, `src/utils/`, `src/services/`, `src/types/`, `features/*/index.ts` first. Applies to every piece inside a new unit too — if `Button` exists globally, `Counter` must use it. Extend or compose. Duplicating an existing implementation is never acceptable. |
| Imports             | No `index.ts` in component/hook/util folders. Import directly: `Button/Button.tsx`                                                                                                                                                                                                                  |
| Promotion           | Move entire folder as-is when a second consumer appears. Never speculate.                                                                                                                                                                                                                           |
| Subcomponents       | One `components/` level only. Need deeper nesting → promote to top-level.                                                                                                                                                                                                                           |
| Hooks               | Never inside component folders. Always in `hooks/` (feature or global). **Every hook must be a folder:** `hooks/useCounter/useCounter.ts` — never a bare file `hooks/useCounter.ts`.                                                                                                                |
| Types               | Private → `Button.types.ts` sibling. Shared → `types/` folder.                                                                                                                                                                                                                                      |
| Routing             | Features own routes (`routes.ts`). `app/router/` only assembles them.                                                                                                                                                                                                                               |
| Styling             | Use project's solution. Default if none: CSS Modules (`.module.css`).                                                                                                                                                                                                                               |
| Testing             | Mirror source name (`Button.test.tsx`). Respect project convention; default `.test.ts(x)`. No mixing.                                                                                                                                                                                               |
| Stories             | `Button.stories.tsx` sibling — only if Storybook is installed.                                                                                                                                                                                                                                      |
| Utils               | One folder = one area of focus. No grouping of unrelated helpers.                                                                                                                                                                                                                                   |

## Never

- **Reimplement something that already exists** — always reuse existing components, hooks, utils, and services, including inside new units being built
- Import feature internals — only `features/<name>/index.ts`
- Add `index.ts` inside component, hook, or util folders
- Create global folders speculatively (second consumer required)
- Put pages in `src/components/` — pages → `features/<name>/pages/`
- Create `shared/` or `common/` folders
- Nest features inside features
- Put hooks inside component folders
- Create a hook as a bare file (`hooks/useFoo.ts`) — it must be a folder (`hooks/useFoo/useFoo.ts`)
- Create a util as a bare file (`utils/formatDate.ts`) — it must be a folder (`utils/formatDate/formatDate.ts`)
- Nest `components/` more than one level deep
- Define routes in `app/router/` — features own their routes
- Create `app/store/` or `app/styles/` unless the project uses them
