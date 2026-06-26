---
description: Absolute gate — blocks all work until the developer declares strict or advisory mode for this repository. Fires on every file before any other instruction.
applyTo: '**'
---

# Project Mode Gate — Critical Rule

**This rule runs before any other instruction, agent action, or task execution.**

## Step 1 — Read `.apm/project-mode`

Check whether the file `.apm/project-mode` exists in the repository root.

---

## If the file does NOT exist — STOP

**Do not read any code. Do not answer any question. Do not take any action beyond the following.**

Ask the developer exactly this, and nothing else:

> **⚠️ Project mode not set — action required before any work can begin.**
>
> This repository has the `javascript-react` APM package installed. This package enforces a shared set of React quality standards across the team: folder structure, component rules, hook rules, TypeScript strictness, accessibility, and testing. Before any AI assistance starts, you must declare how broadly those standards are applied to this codebase.
>
> ---
>
> **`strict`** — Every file in the repository is held to the full standard, regardless of whether it was pre-existing or newly created. Any violation in any file will be flagged.
> → Choose this for **new projects** or repositories that are already fully aligned with these standards.
>
> **`advisory`** — Standards are enforced only on files you create or that you explicitly ask the AI to modify in a given task. Pre-existing files that are outside the scope of a task are left untouched and not audited.
> → Choose this for **existing codebases** that have not yet been migrated to these standards, where flagging every legacy file would create noise and block progress.
>
> In both modes, `critical-donts` (security, secrets, scope) is always fully enforced on every file without exception.
>
> ---
>
> Type `strict` or `advisory` to continue. Your answer will be saved to `.apm/project-mode` and committed with the repository so the whole team shares the same setting.

When the developer answers, write their answer — exactly `strict` or `advisory` — to `.apm/project-mode`. Then confirm:

> `[APM] Mode set to: <mode>. Proceeding.`

Only then continue with the original request.

---

## If the file exists — proceed

Read its value. Declare the active mode at the top of your response: `[Mode: strict]` or `[Mode: advisory]`. Never modify the file.

### strict

All package instructions — `folder-structure`, `react-components`, `react-hooks`, `react-typescript`, `react-accessibility`, `react-testing` — apply to every file, pre-existing or new.

### advisory

Those instructions apply only to files you **create** or that the developer **explicitly asks you to modify**. Do not flag violations in untouched pre-existing files.

---

## Universal — both modes

`critical-donts` always applies to every file without exception. Security, secret, and scope rules are never advisory.
