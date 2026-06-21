---
description: Baseline accessibility rules for React UI.
applyTo: '**/*.{jsx,tsx}'
---

# React Accessibility

- Use semantic HTML elements (`button`, `nav`, `header`, `main`) over generic `div`/`span`.
- Give every form control an associated label.
- Provide meaningful `alt` text for images; use empty `alt` for decorative ones.
- Make all interactive elements keyboard-operable; do not rebuild native controls without ARIA roles and key handling.
- Preserve a visible focus indicator; never remove focus outlines without a replacement.
