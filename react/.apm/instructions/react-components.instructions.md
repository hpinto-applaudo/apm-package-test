---
description: Core quality rules for authoring React components.
applyTo: '**/*.{jsx,tsx}'
---

# React Components

- Use function components only; no class components.
- One component per file; name components in `PascalCase`.
- Keep components focused and small; extract sub-components when they grow.
- Type the component's props explicitly.
- Treat props as immutable; never mutate props or state directly.
- No side effects during render; perform them in effects or event handlers.
- Compute derived values during render instead of duplicating them in state.
- Give list items a stable, unique `key`; never use the array index when items can reorder, insert, or delete.
