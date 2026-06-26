---
description: Testing and quality-gate expectations for React code in any consuming repo.
applyTo: '**/*.{ts,tsx,js,jsx}'
---

# React Testing & Quality Gates

> **Scope:** governed by `.apm/project-mode`. In `advisory` mode, apply these rules only to files you create or are explicitly asked to modify. In `strict` mode, apply to every file.

Detect this repository's testing tooling, scripts, and coverage thresholds, then enforce whatever gates exist rather than assuming a fixed setup.

## Testing

- Write tests for new components, hooks, and utilities before considering work done.
- Cover both success and failure paths, plus edge cases (empty, loading, error states).
- Test behavior and accessible output, not implementation details.
- Use the repo's existing test framework and conventions; do not introduce a new one.

## Quality gates (must pass before completion)

- Detect and run the repo's lint, type-check, format, test, and build scripts (check `package.json`, config files, CI).
- If a code-coverage threshold is configured, meet or exceed it for changed code; never lower it.
- Never disable, skip, or weaken lint rules, type checks, or tests to force a pass.
- Fix the underlying issue rather than suppressing the warning.
- If no gate exists for a concern, follow the defaults below but do not add tooling without approval.

## Default coverage thresholds

When the repo has no configured threshold, target at least **80% global coverage** across all four standard metrics (Jest/Vitest/Istanbul):

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

- Apply these as the global minimum; if the repo already sets higher thresholds, honor the higher value.
- Prioritize meaningful coverage of changed code over chasing the percentage with shallow tests.
