---
description: Core quality rules for authoring React components.
applyTo: '**/*.{jsx,tsx}'
---

# React Components

> **Scope:** governed by `.apm/project-mode`. In `advisory` mode, apply these rules only to files you create or are explicitly asked to modify. In `strict` mode, apply to every file.

- Use function components only; no class components.
- One component per file; name components in `PascalCase`.
- Keep components focused and small; extract sub-components when they grow.
- Type the component's props explicitly.
- Export the component as both a named export and a default export. Export props types, enums, union types, and constants that consumers need to use the component correctly as named exports. Do not export internal implementation details.
- Treat props as immutable; never mutate props or state directly.
- No side effects during render; perform them in effects or event handlers.
- Compute derived values during render instead of duplicating them in state.
- Give list items a stable, unique `key`; never use the array index when items can reorder, insert, or delete.
