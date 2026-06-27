---
description: Baseline accessibility rules for React UI.
applyTo: '**/*.{jsx,tsx}'
---

# React Accessibility

> **Scope:** governed by `.apm/project-mode.json`. In `advisory` mode, apply these rules only to files you create or are explicitly asked to modify. In `strict` mode, apply to every file.

- Use semantic HTML elements (`button`, `nav`, `header`, `main`) over generic `div`/`span`.
- Give every form control an associated label.
- Provide meaningful `alt` text for images; use empty `alt` for decorative ones.
- Make all interactive elements keyboard-operable; do not rebuild native controls without ARIA roles and key handling.
- Preserve a visible focus indicator; never remove focus outlines without a replacement.
