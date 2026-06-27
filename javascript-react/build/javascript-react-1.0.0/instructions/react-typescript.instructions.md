---
description: TypeScript type-safety rules for React code.
applyTo: '**/*.{ts,tsx}'
---

# React TypeScript

> **Scope:** governed by `.apm/project-mode.json`. In `advisory` mode, apply these rules only to files you create or are explicitly asked to modify. In `strict` mode, apply to every file.

- Type all component props, hook returns, and exported function signatures.
- Never use `any`; use `unknown` and narrow the type before use.
- Never use the non-null assertion `!` to silence type errors; handle the null case.
- Validate and type external/API data at the boundary before using it.
- Model mutually exclusive variants with discriminated unions, not optional flags.
