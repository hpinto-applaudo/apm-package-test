# @applaudo/javascript-react

> APM package that equips any AI coding agent with the React primitives, skills, hooks, and engineering standards needed to ship high-quality React applications.

[![APM Package](https://img.shields.io/badge/APM-package-blue)](https://github.com/microsoft/apm)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](./apm.yml)
[![Internal](https://img.shields.io/badge/scope-internal-orange)]()

| | |
| --- | --- |
| **Name** | `javascript-react` |
| **Version** | `1.0.0` |
| **Author** | `applaudo` |
| **Type** | [APM](https://github.com/microsoft/apm) (Agent Package Manager) package |
| **Visibility** | Internal — Applaudo engineering only |
| **Targets** | GitHub Copilot · Claude Code · Cursor · Codex · OpenCode · Gemini · Windsurf · Kiro |

---

## What this is

This is an **internal [APM](https://github.com/microsoft/apm) package**, not an npm/runtime
dependency. It does not ship application code — it ships **agent context**: the
instructions, skills, and hooks that steer an AI coding agent toward our React
standards.

Think of it as `package.json` for your AI agent's brain. Declare it once, run
`apm install`, and every developer's agent — regardless of which assistant they
use — is configured identically with the same React conventions, guardrails, and
best practices. This makes agent output **portable, reproducible, and consistent**
across machines and teams.

## What's inside

| Primitive | Contents | Purpose |
| --- | --- | --- |
| **Instructions** | `react-components`, `react-hooks`, `react-typescript`, `react-accessibility`, `react-testing`, `critical-donts` | Enforce component structure, hook rules, strict typing, a11y, testing gates, and hard security boundaries on every relevant file. |
| **Skills** | `frontend-design`, `react-best-practices` | On-demand domain knowledge for visual/UX design and React/Next.js performance, invoked automatically when a task matches. |
| **Hooks** | `block-env-access` (`PreToolUse`) | Blocks agent access to `.env`, credentials, private keys, and certificates before any read/write/exec. |
| **Transitive deps** | `anthropics/skills` · `vercel-labs/agent-skills` | Pulled in automatically; APM resolves the full tree like npm/pip. |

Instructions apply via `applyTo` globs (e.g. `**/*.{ts,tsx}`), so the agent only
loads the rules relevant to the file it is touching.

## Installation

Install [APM](https://github.com/microsoft/apm) once:

```bash
# macOS / Linux
curl -sSL https://aka.ms/apm-unix | sh

# Windows (PowerShell)
irm https://aka.ms/apm-windows | iex
```

Then add this package to your project:

```bash
apm install applaudo/company-agent-packages/javascript-react
```

Or declare it in your project's `apm.yml` and install the whole tree:

```yaml
# apm.yml
dependencies:
  apm:
    - applaudo/company-agent-packages/javascript-react
```

```bash
apm install   # resolves and configures every detected agent
```

APM writes an `apm.lock.yaml` pinning resolved sources and content hashes, so the
exact same agent context is reproduced on every machine.

## Usage

After installation the primitives are wired into every detected agent
automatically — there is no runtime step. Open the project in your AI-enabled
editor and the agent will:

- Apply the React instruction sets to matching files.
- Invoke the bundled skills when a task falls within their domain.
- Enforce the `block-env-access` hook on every file-touching tool call.

For GitHub Copilot specifically, you can materialize the standards file directly:

```bash
apm compile -t copilot   # writes .github/copilot-instructions.md
```

## Contributing

This is an internal package maintained by Applaudo engineering. Propose changes to
instructions, skills, or hooks via pull request, and run `apm audit` to verify the
package resolves and passes content-security checks before publishing.

---

_Maintained by `applaudo`. For APM concepts and CLI reference, see the
[official documentation](https://microsoft.github.io/apm/)._
