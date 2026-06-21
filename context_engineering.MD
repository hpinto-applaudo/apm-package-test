# Context Engineering Guide

**Purpose:** Practical reference for configuring AI coding agents to produce high-quality, project-relevant code using structured context.

**Audience:** Developers, Architects, Tech Leads

**Format:** Workshop-ready: read, configure, and apply directly to your project.

---

## Table of Contents

1. [What Is Context Engineering](#1-what-is-context-engineering)
2. [Prerequisites](#2-prerequisites)
3. [Context File Types](#3-context-file-types)
4. [APM: Agent Package Manager](#4-apm--agent-package-manager)
5. [AGENTS.md: Agent Instructions](#5-agentsmd--agent-instructions)
6. [Agent Instructions: Tool-Specific Execution Rules](#6-agent-instructions-tool-specific-execution-rules)
7. [MCP Servers: External Tools for Agents](#7-mcp-servers--external-tools-for-agents)
8. [Custom Agents: Specialized AI Assistants](#8-custom-agents--specialized-ai-assistants)
9. [Agent Skills: Reusable Capabilities](#9-agent-skills--reusable-capabilities)
10. [Reusable Prompts: Workflow Automation](#10-reusable-prompts--workflow-automation)
11. [Project Documentation Structure](#11-project-documentation-structure)
12. [Context Lifecycle: Fixed vs. Ephemeral](#12-context-lifecycle--fixed-vs-ephemeral)
13. [Daily Workflow](#13-daily-workflow)
14. [Validation Checklist](#14-validation-checklist)

---

## 1. What Is Context Engineering

Context Engineering is the practice of **designing, organizing, and providing** the information that an AI coding agent needs to produce accurate, project-relevant results. It is not about writing better prompts: it is about structuring the entire information ecosystem around the agent.

### Why It Matters

AI agents use a **finite context window** (token limit). When your project has thousands of files, the agent cannot read everything. What you put into that window determines the quality of the output.

| Problem                                                   | Root Cause                               | Solution                                                                        |
| --------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| Agent generates code that doesn't match your architecture | No architecture documentation in context | Provide structured context via `.apm/contexts/` files compiled into `AGENTS.md` |
| Agent uses wrong libraries or patterns                    | No dependency/convention rules           | Define mandatory dependencies and patterns                                      |
| Agent contradicts previous decisions                      | Stale or conflicting context documents   | Clean ephemeral context after each feature                                      |
| Agent produces low-quality or untested code               | No quality gates in instructions         | Encode testing and quality rules in agent config                                |

### Core Principle

> **You are the guardian of context.** Design it, organize it, provide it, and keep it clean. The agent produces output proportional to the quality of its input context.

### The Three Pillars

| Pillar              | What It Is                                        | Who Controls It                     |
| ------------------- | ------------------------------------------------- | ----------------------------------- |
| **Instructions**    | Rules, personality, and constraints for the agent | You (via config files)              |
| **Memory (Tokens)** | Everything the agent "knows" at a given moment    | You (decide what enters the window) |
| **Tools**           | External capabilities: file system, docs, APIs    | IDE + MCP configuration             |

---

## 2. Prerequisites

Before applying context engineering, ensure you have:

| Requirement                           | Action                                                                                        | Responsibility |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | -------------- |
| AI coding agent installed and active  | Verify your tool is up to date (GitHub Copilot, Claude Code, Cursor, Windsurf, or equivalent) | Developer      |
| IDE supports agents and MCP           | VS Code, JetBrains, or any CLI tool that supports agents and MCP                              | Developer + IT |
| APM installed                         | Follow install instructions at [microsoft.github.io/apm](https://microsoft.github.io/apm)     | Developer      |
| Repository access                     | Clone and run the project locally                                                             | Developer      |
| Context7 account (free)               | Sign up at [context7.com](https://context7.com)                                               | Developer      |
| Familiarity with project architecture | Read existing `AGENTS.md` and the `.apm/contexts/` files                                      | Developer      |

---

## 3. Context File Types

Different files serve different purposes in the context ecosystem. Here is a summary of the key files, where they live, and when agents consume them:

| File                                  | Location             | Purpose                                                                         | How It Gets There    |
| ------------------------------------- | -------------------- | ------------------------------------------------------------------------------- | -------------------- |
| `.apm/instructions/*.instructions.md` | `.apm/instructions/` | Always-on pointers to context files — your authoring surface                    | Hand-authored        |
| `.apm/contexts/*.context.md`          | `.apm/contexts/`     | Full rules, conventions, and guidance loaded on demand — your authoring surface | Hand-authored        |
| `.apm/agents/*.agent.md`              | `.apm/agents/`       | Custom agent definitions — your authoring surface                               | Hand-authored        |
| `.apm/prompts/*.prompt.md`            | `.apm/prompts/`      | Reusable prompt templates — your authoring surface                              | Hand-authored        |
| `apm.yml`                             | Repository root      | APM manifest: declares all primitives and dependencies                          | Hand-authored        |
| `AGENTS.md`                           | Repository root      | Compiled agent context — auto-loaded by most AI agents                          | `apm compile` output |
| `CLAUDE.md`                           | Repository root      | Compiled context for Claude Code                                                | `apm compile` output |
| `.github/copilot-instructions.md`     | `.github/`           | Compiled rules for GitHub Copilot                                               | `apm compile` output |
| `.cursor/rules/`                      | `.cursor/`           | Compiled rules for Cursor                                                       | `apm compile` output |
| `.github/agents/`, `.github/prompts/` | `.github/`           | Deployed agent and prompt files for Copilot                                     | `apm install` output |
### How They Relate

```
┌─────────────────────────────────────────────────────────┐
│                    Context Hierarchy                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tier 1 — APM source (what you author)                  │
│  ├── .apm/instructions/   .apm/contexts/                │
│  └── apm.yml (declares agents, prompts, skills, MCP)    │
│                         │                               │
│                         ▼                               │
│  Tier 2 — APM pipeline                                  │
│  ├── apm install → fetches deps into apm_modules/,      │
│  │   deploys agents, prompts, skills, MCP config        │
│  │   into harness dirs                                  │
│  └── apm compile --target <targets> → reads             │
│      apm_modules/ + .apm/instructions/ to produce       │
│      compiled context files                             │
│                         │                               │
│                         ▼                               │
│  Tier 3 — Compiled outputs (never edited directly)      │
│  ├── AGENTS.md, CLAUDE.md                               │
│  ├── .github/copilot-instructions.md                    │
│  ├── .cursor/rules/, .windsurf/, and equivalents        │
│  └── Ephemeral context (requirements.md, plan.md,       │
│      tasks.md) created and deleted per feature          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

> **Nothing in `.github/`, `.claude/`, `.cursor/`, `.windsurf/`, `AGENTS.md`, or `CLAUDE.md` is authored by hand.** All of those files are either written by `apm install` or generated by `apm compile`. Your only authoring surface is `.apm/` source files and `apm.yml`.

---

## 4. APM: Agent Package Manager

APM (Agent Package Manager) manages AI agent configuration the same way `package.json` manages Node dependencies. Agent primitives (instructions, contexts, skills, agents, prompts) are declared in `apm.yml`, resolved with `apm install`, and compiled into tool-specific context files with `apm compile`. The generated files (`AGENTS.md`, `CLAUDE.md`) are outputs, not sources. The `.apm/` directory is what developers own and maintain.

### The `.instructions.md` vs `.context.md` Split

This is the most important design decision in APM's authoring model.

**Instructions** (`<name>.instructions.md` under `.apm/instructions/`) are always-on: every agent loads them at the start of every session. Because they are always loaded, they must be short: a heading and a single line pointing to the context file. Putting detailed rules here bloats the agent's context window on every interaction, regardless of relevance.

> This design is supported by empirical evidence: research shows that AGENTS.md as a concise index reduces agent runtime by ~29% and output token consumption by ~17% compared to agents operating without it, because agents spend less time on exploratory navigation (Lulla et al., [arXiv:2601.20404](https://arxiv.org/abs/2601.20404)). Keeping instructions as lightweight pointers and loading full context on demand extends this benefit further.

**Contexts** (`<name>.context.md` under `.apm/contexts/`) are the full content: the actual rules, conventions, and detailed guidance. Agents load them on demand when they determine the context is relevant. This is where the substance belongs. Length here is fine because the content is only loaded when needed.

The pattern: the instruction tells the agent a rule set exists and where to find it. The context contains the rule set itself. When authoring `.apm/contexts/` files, include the complete rules, conventions, and guidance that will inform the generated output: this is the content that ends up in `AGENTS.md` after compilation.

Whether starting fresh or decomposing an existing `AGENTS.md`, each logical concern (architecture rules, commit conventions, testing standards) maps to one instruction/context pair. For a step-by-step decomposition workflow with a reference table of common sections and suggested primitive names, see [guides/setup/migrate-to-apm.md](../setup/migrate-to-apm.md).

### Frontmatter Requirement

Every instruction file requires a YAML frontmatter block with at minimum an `applyTo` field. Without it, `apm compile` will not process the file correctly:

```markdown
---
applyTo: "**"
---
# Architecture
For full guidelines, see [.apm/contexts/architecture.context.md](../contexts/architecture.context.md).
```

### The `--target` Flag

`apm install` must run before `apm compile`: compile reads from `apm_modules/`, which install populates. The `--target` flag must always be explicit:

```bash
apm install
apm compile --target copilot                 # single-tool repo
apm compile --target claude,copilot          # multi-tool repo
apm compile --target claude,copilot,cursor   # add targets for every tool the team uses
```

Without an explicit target, `apm compile` auto-detects targets from existing folders and may generate context files for tools the team does not use. Only generate what you need.

### CLAUDE.md

When the `claude` target is included in `apm compile`, a `CLAUDE.md` file is generated at the repo root alongside `AGENTS.md`. This is the context bootstrap file Claude Code reads at the start of every session. Like `AGENTS.md`, it is a generated output: do not edit it directly.

> **`apm compile` reads `.apm/instructions/*.instructions.md` files and writes them into the target output files (`AGENTS.md`, `CLAUDE.md`, etc.).** All other primitive types (skills, agents, prompts, hooks, commands, and MCP servers) are deployed by `apm install` directly into the harness directories each tool reads. If a custom agent, skill, or prompt is not appearing where expected, the issue is in `apm install` and the `apm.yml` declaration: not in `apm compile`.

### Reproducibility

Anyone who clones the repo runs `apm install` and gets an identical agent setup. Commit `apm.yml`, `apm.lock.yaml`, and the entire `.apm/` directory. Add `apm_modules/` to `.gitignore`: it is a local dependency cache and must not be tracked.

> For repos with a hand-authored `AGENTS.md`, see [guides/setup/migrate-to-apm.md](../setup/migrate-to-apm.md).

---

## 5. AGENTS.md: Agent Instructions

> `AGENTS.md` is generated by `apm compile` from `.apm/instructions/` source files. Do not edit it directly — changes will be overwritten on the next compile run. The guidance below describes what belongs in your `.apm/contexts/` files, which are the actual authoring surface. Instructions files act as always-on pointers to context files; context files contain the substance that ends up in the compiled output.

### What to Put in Your `.apm/contexts/` Files

A well-structured set of `.apm/contexts/` files should cover:

1. **Build/Test/Lint commands**: especially single-test execution
2. **Architecture overview**: modules, layers, data flow
3. **Code style and conventions**: naming, error handling, imports
4. **Mandatory dependencies**: DI framework, ORM, config library
5. **Quality gates**: coverage requirements, linting rules
6. **Critical don'ts**: common mistakes the agent should avoid

### Example: An instruction/context pair

An `architecture` pair is a typical starting point. The instruction file is always short — frontmatter and a single pointer. The context file contains the full substance.

**`.apm/instructions/architecture.instructions.md`**

```markdown
---
applyTo: "**"
---
# Architecture
For full guidelines, see [.apm/contexts/architecture.context.md](../contexts/architecture.context.md).
```

**`.apm/contexts/architecture.context.md`**

```markdown
# Architecture Guidelines

## Project Structure
[Your top-level directory layout with a one-line comment per folder]

## Feature Structure
ALWAYS follow this pattern for new features:
[your-feature-directory-pattern]/
├── [entry point file]
├── [model or domain file]
├── [repository or data access file]
└── [service or use case file]

## Mandatory Dependencies
- DI: [your approved dependency injection library]
- Config: [your approved configuration library]
- DB: [your approved ORM or data access library]
- Validation: [your approved validation library]

## Critical Don'ts
- DON'T put business logic in the [presentation/controller/handler] layer
- DON'T hardcode configuration values
```

Each logical concern gets its own pair. For the full list of recommended primitive names and what each context file should cover, see [guides/setup/migrate-to-apm.md](../setup/migrate-to-apm.md).

---

## 6. Agent Instructions: Tool-Specific Execution Rules

### What It Is

The instructions primitive governs how the agent assists during coding — conventions, patterns, what to ask before acting. You author instructions once in `.apm/instructions/` as instruction/context pairs. `apm compile` transforms them into the tool-specific file each target expects. There is no per-tool authoring: the same source produces all outputs.

The compiled file location depends on the target:

| Target     | Compiled output                                               |
| ---------- | ------------------------------------------------------------- |
| `copilot`  | `.github/copilot-instructions.md` and `.github/instructions/` |
| `claude`   | `.claude/`                                                    |
| `cursor`   | `.cursor/rules/` (using `.mdc` extension)                     |
| `windsurf` | `.windsurf/`                                                  |
| `codex`    | Folded into `AGENTS.md` (no native instructions primitive)    |
| `gemini`   | Folded into `GEMINI.md` (no native instructions primitive)    |

Never edit these files directly. They are overwritten on every `apm compile` run.

### When to Use It

Author instruction/context pairs under `.apm/instructions/` and `.apm/contexts/` whenever you have conventions, patterns, or guidance that governs how the agent writes code day-to-day. The instruction file is the always-on pointer; the context file is the on-demand substance. Together they form the primitive that compiles into every tool-specific output file. Do not author tool-specific files directly.

### What to Include

| Section               | Purpose                                | Example Content                                                                               |
| --------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Project overview      | What the project is and its tech stack | "Monorepo with layered architecture and a REST API frontend"                                  |
| Key conventions       | Rules the agent must always follow     | "Use the repository's DI framework for all dependency wiring", "DTOs at all layer boundaries" |
| Architecture pointers | Where to find canonical patterns       | "See `src/features/auth/` as the reference implementation for new features"                   |
| Testing rules         | How to write tests                     | "Table-driven tests, integration tests use the project's container test helpers"              |
| Dependency rules      | Which libraries to use                 | "Use the project's approved ORM, config, and validation libraries — see architecture context" |
| What NOT to do        | Explicit anti-patterns                 | "Don't put business logic in the presentation layer", "Don't hardcode configuration values"   |

### Example: a generic coding-standards pair

The instruction pointer stays minimal. The context file is where the actual rules live.

**`.apm/instructions/coding-standards.instructions.md`**

```markdown
---
applyTo: "**"
---
# Coding Standards
For full conventions, see [.apm/contexts/coding-standards.context.md](../contexts/coding-standards.context.md).
```

**`.apm/contexts/coding-standards.context.md`**

```markdown
# Coding Standards

## Conventions
- [Your naming conventions: files, functions, variables]
- [Your error handling pattern]
- [Your import ordering rules]

## Dependency Rules
- [Approved DI framework and how to use it]
- [Approved config library]
- [Approved ORM or data access pattern]

## Quality Gates
- [Minimum test coverage threshold]
- [Complexity limits]
- [Linting rules]

## Critical Don'ts
- [Anti-patterns specific to your project]
```

For the full list of recommended primitive names, see [guides/setup/migrate-to-apm.md](../setup/migrate-to-apm.md).

Both `AGENTS.md` and `.github/copilot-instructions.md` are compiled from the same `.apm/instructions/` source files. You do not maintain them separately. Run `apm compile --target copilot` to update the Copilot output; run `apm compile --target claude` for Claude Code; run both together for repos with multiple tools. The source is always `.apm/`.

---

## 7. MCP Servers: External Tools for Agents

### What Is MCP

**Model Context Protocol (MCP)** is an open standard that allows AI agents to connect to external tools and data sources. Think of MCP servers as "plugins" that extend what the agent can do beyond reading files and generating text.

### Why You Need It

Without MCP, your agent only knows what's in your codebase and its training data (which has a cutoff date). With MCP, the agent can:

- **Read up-to-date library documentation** (Context7)
- **Query project management tools** (Jira, Linear)
- **Access databases** (PostgreSQL, MongoDB)
- **Call APIs** (GitHub, Slack, custom services)

### Declaring MCP Servers in APM

MCP servers are first-class APM dependencies. Declare them in `apm.yml` under `dependencies.mcp:` and `apm install` writes the per-harness MCP configuration automatically — no manual IDE config needed.

```yaml
dependencies:
  mcp:
    - microsoft/azure-devops-mcp
    - github/github-mcp-server
```

After running `apm install`, the MCP server config is written to every target harness directory. Anyone who clones the repo and runs `apm install` gets the same MCP setup without manual configuration.

### Context7: Library Documentation for AI

Context7 provides library documentation in a format optimized for AI consumption (compact Markdown, not HTML). This means your agent can look up the latest API signatures, usage examples, and best practices for any supported library.

#### Setup

**Via APM (recommended):**

```bash
apm mcp install io.github.upstash/context7
```

This adds Context7 to `apm.yml` and wires it into every detected client in one step. To include your API key for higher rate limits:

```yaml
# apm.yml — added automatically by apm mcp install, edit to add env
dependencies:
  mcp:
    - name: io.github.upstash/context7
      env:
        CONTEXT7_API_KEY: "${CONTEXT7_API_KEY}"
```

Get a free API key at [context7.com/dashboard](https://context7.com/dashboard). The API key is optional — Context7 works without it at basic rate limits.

**Manual fallback (if not using APM):**

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

For other clients (Cursor, Claude Code, Windsurf), see [context7.com/docs/resources/all-clients](https://context7.com/docs/resources/all-clients).

#### Verify It Works

In your agent's chat interface, ask:

```
Do you have access to Context7? If yes, look up the latest documentation
for [one of your project's key libraries].
```

The agent should return current documentation, not just its training data.

### Other Useful MCP Servers

| MCP Server     | Purpose               | Example Use Case                              |
| -------------- | --------------------- | --------------------------------------------- |
| **Context7**   | Library documentation | "How do I use bun's `NewSelect()` with CTEs?" |
| **GitHub**     | Repository operations | "List open PRs with failing checks"           |
| **PostgreSQL** | Database queries      | "Show me the schema for the users table"      |
| **Fetch**      | Web requests          | "Get the latest release notes for Go 1.24"    |

### Assigning MCP Tools to Custom Agents

MCP tools declared in `apm.yml` are available to all agents once deployed. To restrict a specific MCP tool to a specific agent, reference it in the agent's `.apm/agents/` definition. See Section 8 for how agent files are authored.

---

## 8. Custom Agents: Specialized AI Assistants

### What Are Custom Agents

Custom agents are **project-specific AI assistants** with tailored instructions, specialized knowledge, and assigned tools. Instead of using a generic Copilot that knows nothing about your project, you create agents that are experts in your codebase.

### When to Create Them

| Scenario                                           | Generic Copilot      | Custom Agent                     |
| -------------------------------------------------- | -------------------- | -------------------------------- |
| Quick syntax question                              | Yes: Fine            | Overkill                         |
| Implement a new feature following project patterns | No: Misses patterns  | Yes: Follows architecture        |
| Code review against project standards              | No: Generic advice   | Yes: Checks specific rules       |
| Write tests matching project conventions           | No: Generic patterns | Yes: Matches existing test style |

### Authoring Agents with APM

Agents are authored as `.agent.md` files under `.apm/agents/`. `apm install` deploys them to the appropriate harness directory for each target (`.github/agents/` for Copilot, `.claude/agents/` for Claude Code, and so on). Never create agent files in harness directories directly — they will be overwritten.

```
.apm/
└── agents/
    ├── project-developer.agent.md
    ├── code-reviewer.agent.md
    └── test-writer.agent.md
```

Declare agents in `apm.yml` if they have dependencies or tool assignments. Run `apm install` to deploy.

### Recommended Agents

#### 1. Project Developer

**Purpose:** Expert in building new features following the project's architecture and conventions.

**File:** `.apm/agents/project-developer.agent.md`

```markdown
# Project Developer Agent

You are an expert developer for this project. Before writing any code:

1. Read `AGENTS.md` to understand the architecture and conventions.
2. Identify the module most similar to what you are building and follow its patterns exactly.
3. Check for existing components to reuse before creating new ones.

## Rules
- Follow the architectural patterns documented in your architecture context file.
- Use the project's approved dependency injection, configuration, and validation libraries.
- Wrap all errors with context following the project's error handling conventions.

## Testing (MANDATORY)
- Write tests first (TDD).
- Follow the test conventions in your testing-standards context file.
- Meet the project's minimum coverage threshold for all new code.

## Before Finishing
- Verify the code follows the patterns in the reference implementation documented in your architecture context.
- Ensure no business logic has leaked into the wrong layer.
- Check that all new types are validated according to project conventions.
```

#### 2. Code Reviewer

**Purpose:** Reviews code for architecture compliance, best practices, and quality standards.

**File:** `.apm/agents/code-reviewer.agent.md`

```markdown
# Code Review Agent

You are a senior code reviewer for this project. Analyze provided code against:

## Architecture Compliance
- Does the code follow the project's layered architecture boundaries?
- Is business logic in the correct layer?
- Are new features in the correct directory structure?

## Code Quality
- Are errors wrapped with context following project conventions?
- Is function complexity within project limits?
- Are there magic numbers that should be constants?
- Are all inputs validated according to project standards?

## Testing
- Do tests exist for all new public functions?
- Do tests follow the project's conventions (see testing-standards context)?
- Is coverage at or above the project threshold?

## Dependencies
- Are approved libraries used for DI, configuration, and data access?
- Are there unnecessary new dependencies?

## Security
- Are there any hardcoded secrets or credentials?
- Are data access patterns following project-approved abstractions?

## Output Format
- [CRITICAL]: Must fix before merge
- [WARNING]: Should fix, creates tech debt if not
- [SUGGESTION]: Nice to have improvement
- [PASS]: Highlight well-written patterns
```

#### 3. Test Writer

**Purpose:** Generates comprehensive tests matching project conventions.

**File:** `.apm/agents/test-writer.agent.md`

```markdown
# Test Writer Agent

You are a testing expert for this project. When writing tests:

## Conventions
- Follow the test conventions documented in the testing-standards context file.
- Match the structure and naming patterns of existing test files in the repo.
- Include both success and failure cases.
- Test edge cases: nil inputs, empty collections, boundary values.

## Integration Tests
- Use the project's approved integration test helpers and container setup patterns.
- Follow the bootstrap pattern established in existing integration tests.

## Quality
- Target the project's minimum coverage threshold on files being tested.
- Only create or modify test files.
```

#### 4. Refactoring Agent

**Purpose:** Improves existing code while preserving behavior and test coverage.

**File:** `.apm/agents/refactorer.agent.md`

```markdown
# Refactoring Agent

You are a refactoring specialist. When improving existing code:

## Rules
- NEVER change behavior: only improve structure
- NEVER reduce test coverage: add tests if needed
- Maintain the project's architectural layer boundaries
- Preserve all public API signatures unless explicitly asked to change

## Focus Areas
- Extract complex functions (complexity > 15) into smaller ones
- Replace magic numbers with named constants
- Improve error messages with more context
- Consolidate duplicated code into shared utilities
- Ensure consistent naming across related modules

## Process
1. Read and understand the current code and its tests
2. Identify specific improvements with rationale
3. Make changes incrementally (one concern at a time)
4. Verify all existing tests still pass after each change
5. Add tests for any newly extracted functions
```

### Generating an Agent Prompt from Your Context Files

Use this prompt to create a custom agent tailored to your project:

````
Read the `.apm/contexts/` files for this project. Based on the architecture,
conventions, testing standards, and dependency rules documented there, create
a specialized agent that:

- Is an expert in the project's tech stack and architecture
- Follows the implemented patterns exactly, using existing modules as reference
- Prioritizes reuse of existing components
- Enforces the quality gates defined in the project's context files
- Delegates to context files for rules rather than duplicating them inline

Save the result to `.apm/agents/<agent-name>.agent.md`.
````

### Evolving Agents Over Time

Agent instructions are living documents. When the agent makes a repeated mistake:

1. Fix the immediate issue.
2. Update the relevant `.apm/contexts/` file so the rule is captured at the source.
3. If the mistake is agent-specific (not a general convention), update `.apm/agents/<name>.agent.md`.
4. Run `apm install` to redeploy.
5. Share the update with the team.

This creates a feedback loop where both agents and context files get better over time.

---

## 9. Agent Skills: Reusable Capabilities

### Skills vs. Agents

A custom agent is a persona: a defined role, a set of rules, and a process to follow. A skill is a discrete, reusable capability the agent can invoke: a tool or action, not the agent itself. You configure agents; you compose skills into them. The same skill can be reused across multiple agents, and updating a skill improves every agent that uses it without touching any agent definition.

This separation keeps agent instructions focused. Rather than duplicating capability logic across multiple agent definitions, extract it as a skill and compose it into each agent that needs it.

### Consuming Skills via APM

Skills from external sources (such as the `anthropics/skills` public repository) are declared as APM dependencies in `apm.yml` and deployed with `apm install`. This is the recommended way to consume skills — it keeps the setup reproducible and version-controlled.

```yaml
dependencies:
  apm:
    - anthropics/skills/pdf            # single skill from a package
    - anthropics/skills/use-modern-go  # another skill
```

After `apm install`, the skills are deployed to the harness directories each target expects. Anyone cloning the repo gets the same skills without manual setup.

To author a custom skill for your project, create a `SKILL.md` under `.apm/skills/<name>/` and declare it in `apm.yml`. The skill is then available to any agent that references it.

### Two Concrete Examples

| Skill             | Source                           | What it does                                                                                                                                                                                 |
| ----------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PDF**           | `anthropics/skills (skills/pdf`  | Triggered when the agent needs to work with PDF files) reading, extracting text or tables, merging, splitting, rotating, OCR. Loaded automatically; no manual invocation needed.             |
| **use-modern-go** | `JetBrains/go-modern-guidelines` | Detects the Go version from `go.mod` and enforces modern idioms for that version. Solves the training data lag problem where agents default to outdated patterns even when newer ones exist. |

Both examples follow the same anatomy: a `SKILL.md` with a clear trigger description, explicit instructions, and any bundled references. The trigger description is what the agent reads to decide whether to load the skill.

### Trigger Descriptions

The agent decides whether to load a skill based on its trigger description alone. A vague trigger is never loaded; an overly broad one loads when irrelevant and wastes context. Write trigger descriptions as precise activation conditions: specific enough that the agent can determine relevance without loading the skill first.

### Where to Explore

→ `https://github.com/anthropics/skills`

---

## 10. Reusable Prompts: Workflow Automation

### What Are Reusable Prompts

Reusable prompts are **slash commands** that automate multi-step workflows. Instead of typing long instructions every time, you invoke the slash command in your agent's chat interface. They are authored in `.apm/prompts/` and deployed to each tool's harness directory by `apm install`.

### When to Use Them

| Use Case               | Slash Command    | What It Does                                                             |
| ---------------------- | ---------------- | ------------------------------------------------------------------------ |
| Code review            | `/review`        | Reviews code against project standards, architecture, and quality gates  |
| Test coverage          | `/test-coverage` | Analyzes coverage for a package and generates missing tests              |
| Scaffold a feature     | `/scaffold`      | Creates the directory structure and boilerplate for a new module         |
| Refactor code          | `/refactor`      | Identifies and applies structural improvements while preserving behavior |
| Generate documentation | `/document`      | Produces or updates docs (ADRs, API docs, READMEs) from source code      |

### Authoring Prompts with APM

Prompts are authored as `.prompt.md` files under `.apm/prompts/`. `apm install` deploys them to the appropriate harness directory for each target (`.github/prompts/` for Copilot, `.claude/commands/` for Claude Code, and so on). Never create prompt files in harness directories directly.

Every prompt file requires a YAML frontmatter block with a `description` field:

```markdown
---
description: Brief description of what this prompt does
---

Your prompt instructions here.

$ARGUMENTS
```

Use `$ARGUMENTS` to capture user input passed after the slash command.

#### Example: Code Review Prompt

**File:** `.apm/prompts/review.prompt.md`

```markdown
---
description: Perform a code review of the specified files against project standards
---

Review the following code changes against the project's standards:

$ARGUMENTS

Check against:
1. **Architecture**: Does it follow the project's layered architecture? Are boundaries respected?
2. **Patterns**: Does it match the reference implementation documented in the architecture context?
3. **Error Handling**: Are errors wrapped with context following project conventions?
4. **Testing**: Do tests follow project conventions? Is coverage at or above the threshold?
5. **Dependencies**: Are only approved libraries used? Are there unnecessary new dependencies?
6. **Security**: No hardcoded secrets? Data access uses approved abstractions?
7. **Naming**: Consistent with existing codebase conventions?

Output findings using severity levels:
- [CRITICAL]: Must fix before merge
- [WARNING]: Should fix to avoid tech debt
- [SUGGESTION]: Nice improvement
- [PASS]: Well-implemented patterns worth noting
```

#### Example: Test Coverage Prompt

**File:** `.apm/prompts/test-coverage.prompt.md`

```markdown
---
description: Analyze test coverage for a module and generate missing tests
---

Analyze test coverage for:

$ARGUMENTS

Steps:
1. Run the project's test command with coverage reporting for the specified module.
2. Identify uncovered functions and branches.
3. Generate tests for uncovered code following the project's test conventions.
4. Verify new tests achieve the project's minimum coverage threshold.
5. Only create or modify test files.
```

#### Example: Scaffold Prompt

**File:** `.apm/prompts/scaffold.prompt.md`

```markdown
---
description: Scaffold a new feature module with the correct directory structure and boilerplate
---

Create a new feature module for:

$ARGUMENTS

Steps:
1. Read `AGENTS.md` to understand the project's architecture and directory conventions.
2. Find the most similar existing module as a reference implementation.
3. Create the directory structure following the exact same pattern as the reference.
4. Register any new dependencies using the project's approved DI approach.
5. Add skeleton test files for every new source file.
6. Do NOT implement business logic: only create the structure and boilerplate.
```

#### Example: Refactor Prompt

**File:** `.apm/prompts/refactor.prompt.md`

```markdown
---
description: Identify and apply refactoring improvements while preserving behavior
---

Refactor the following code:

$ARGUMENTS

Rules:
- NEVER change external behavior: only improve internal structure
- NEVER reduce test coverage: add tests if extracting new functions
- Maintain the project's architectural layer boundaries

Focus areas:
1. Extract functions with complexity > 15 into smaller, single-responsibility units
2. Replace magic numbers and strings with named constants
3. Improve error messages with additional context
4. Consolidate duplicated logic into shared helpers
5. Ensure consistent naming conventions across the module
6. Run existing tests after each change to verify nothing broke
```

#### Example: Document Prompt

**File:** `.apm/prompts/document.prompt.md`

```markdown
---
description: Generate or update documentation from source code
---

Generate documentation for:

$ARGUMENTS

Steps:
1. Analyze the specified code to understand its purpose, inputs, outputs, and behavior
2. Determine the correct doc type:
   - New architectural decision → create an ADR in docs/architecture/adr/
   - API endpoint changes → update API documentation
   - New module or feature → update README or create a module-level doc
3. Follow existing documentation style and format in the project
4. Include: purpose, usage examples, configuration, and dependencies
5. Write for developers who are new to this module
```

---

## 11. Project Documentation Structure

### Why Structure Matters

AI agents perform best when documentation is **organized, discoverable, and up to date**. A well-structured `docs/` directory acts as a knowledge base that agents can navigate to find patterns, decisions, and requirements.

### Recommended Structure

```
docs/
├── guidelines/                      # Permanent: coding standards and processes
│   ├── coding-standards.md          # Language-specific style rules
│   ├── pr-process.md                # Pull request workflow and expectations
│   ├── branching-strategy.md        # Git workflow (e.g., Trunk-Based Development)
│   ├── testing-standards.md         # Test conventions, coverage requirements
│   └── security-guidelines.md       # Security practices and checklists
│
├── architecture/                    # Permanent: system design and decisions
│   ├── overview.md                  # High-level architecture diagram and description
│   ├── adr/                         # Architecture Decision Records
│   │   ├── 001-choose-architecture-style.md
│   │   ├── 002-select-data-access-library.md
│   │   └── 003-define-api-contract-format.md
│   ├── data-model.md               # Entity relationships and DB schema
│   └── deployment.md               # Infrastructure and deployment topology
│
├── devops/                          # Permanent: CI/CD and environment docs
│   ├── ci-pipeline.md              # CI stages, quality gates, automated checks
│   ├── environments.md             # Dev, staging, prod configurations
│   ├── docker-setup.md             # Container build and compose instructions
│   └── monitoring.md               # Logging, metrics, alerts, dashboards
│
└── features/                        # Ephemeral: per-feature working documents
    └── <feature-name>/
        ├── requirements.md          # What to build (requirements, acceptance criteria)
        ├── plan.md                  # How to build it (architecture, phases)
        ├── tasks.md                 # Ordered task list with dependencies
        └── diagrams/
            ├── context.mmd          # System context (Mermaid)
            ├── sequence.mmd         # Key interaction flows
            └── deployment.mmd       # Feature-specific deployment changes
```

### What Goes Where

| Document               | Location                               | Lifecycle                                 | Agent Usage                                             |
| ---------------------- | -------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Coding standards       | `docs/guidelines/`                     | Permanent: update when conventions change | Agent references for style compliance                   |
| Architecture decisions | `docs/architecture/adr/`               | Permanent: append-only (new ADRs)         | Agent understands *why* the code is structured this way |
| Feature requirements   | `docs/features/<name>/requirements.md` | Ephemeral: delete after feature ships     | Agent knows *what* to build                             |
| Feature plan           | `docs/features/<name>/plan.md`         | Ephemeral: delete after feature ships     | Agent knows *how* to build it                           |
| Task list              | `docs/features/<name>/tasks.md`        | Ephemeral: delete after feature ships     | Agent knows *what order* to build in                    |

### Architecture Decision Records (ADRs)

ADRs document the **why** behind architectural choices. They are particularly valuable for AI agents because they prevent the agent from suggesting alternatives to decisions already made.

#### ADR Template

```markdown
# ADR-001: [Decision Title]

**Status:** Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** [Team members involved]

## Context
What is the problem or situation that led to this decision?

## Decision
What is the specific decision made?

## Consequences
### Positive
- What benefits does this decision bring?

### Negative
- What trade-offs or downsides does this introduce?

### Neutral
- What are the side effects that are neither good nor bad?

## Alternatives Considered
| Option        | Pros | Cons | Why Not |
| ------------- | ---- | ---- | ------- |
| Alternative A | ...  | ...  | ...     |
| Alternative B | ...  | ...  | ...     |
```

### Keeping Documentation Clean

| Frequency              | Action                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Per feature            | Create working documents (requirements, plan, tasks) in `docs/features/<name>/`. Delete after merge.                         |
| Per sprint             | Review `docs/features/`: remove completed features.                                                                          |
| Per quarter            | Review `docs/guidelines/` and `docs/architecture/`: update if conventions changed.                                           |
| On architecture change | Add new ADR. Update `overview.md`. Update the relevant `.apm/contexts/` files and run `apm compile --target <your-targets>`. |

---

## 12. Context Lifecycle: Fixed vs. Ephemeral

### Fixed Context (Permanent)

These files stay in the repo and evolve slowly:

| File                                                          | Purpose                                       | Update Frequency                                                                     |
| ------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `.apm/instructions/` and `.apm/contexts/`                     | Source of all agent rules and conventions     | When architecture, commands, or conventions change — run `apm compile` after editing |
| `AGENTS.md` / `CLAUDE.md` / `.github/copilot-instructions.md` | Compiled agent context — do not edit directly | Regenerated automatically via `apm compile`                                          |
| `docs/architecture/`                                          | System design for human reference             | On architectural changes                                                             |
| `docs/guidelines/`                                            | Coding standards for human reference          | On process changes                                                                   |

### Ephemeral Context (Temporary)

These files are created per feature and deleted after completion:

| File              | Created When                    | Deleted When                  |
| ----------------- | ------------------------------- | ----------------------------- |
| `requirements.md` | Feature work begins             | Feature ships and is verified |
| `plan.md`         | After requirements are approved | Feature ships and is verified |
| `tasks.md`        | After plan is complete          | Feature ships and is verified |

### Why Clean Up Ephemeral Context

If you leave old working documents in the repo and create new ones that contradict them (e.g., a redesigned feature), the agent may find **both versions** in its context window and produce inconsistent code. Clean context = consistent output.

```
[WARNING]  OLD requirements say: "Use REST endpoints for all communication"
[WARNING]  NEW requirements say: "Use gRPC for service-to-service calls"
→ Agent gets confused, generates a REST endpoint that wraps a gRPC call
```

**Rule:** Delete ephemeral documents when they no longer apply.

### Alternative: Archive Instead of Delete

If your team requires document retention (audit trails, onboarding, compliance), you can **archive** completed ephemeral files instead of deleting them. The key requirement is that archived files must be **excluded from the agent's context**.

#### How to Set Up Archiving

1. Create an archive directory:

```
docs/features/archive/<feature-name>/
```

2. Move completed requirements, plans, and tasks there after the feature ships.

3. Add this rule to the relevant `.apm/contexts/` file (for example, `architecture.context.md`) and run `apm compile --target <your-targets>`:

```markdown
## Archived Context
NEVER read or reference files under `docs/features/archive/`.
These are retained for historical purposes only and may contain
outdated decisions that no longer apply.
```

#### Choosing Your Approach

| Approach    | Pros                                                                      | Cons                                                            | Best For                                                      |
| ----------- | ------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| **Delete**  | Cleanest context; no risk of agent confusion; files remain in git history | No quick access to past specs without git                       | Teams comfortable with git history                            |
| **Archive** | Easy access to past decisions; supports audits and onboarding             | Requires agent exclusion rules; risk if rules are misconfigured | Teams with compliance or documentation retention requirements |

Both approaches achieve the same goal: **keeping stale context out of the agent's context window.** Choose the one that fits your team's needs.

---

## 13. Daily Workflow

### Feature Development Flow

| Phase            | Action                                                                                                       | Chat Strategy     | Working Documents                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ----------------- | --------------------------------- |
| **1. Define**    | Write feature requirements and acceptance criteria in a `requirements.md` file under `docs/features/<name>/` | New chat          | Creates `requirements.md`         |
| **2. Plan**      | Design implementation approach and task breakdown                                                            | New chat          | Creates `plan.md`, `tasks.md`     |
| **3. Verify**    | Cross-check requirements, plan, and tasks for gaps and contradictions                                        | New chat          | Reads requirements + plan + tasks |
| **4. Implement** | Execute tasks from the plan one at a time                                                                    | New chat per task | Uses plan + tasks                 |
| **5. Review**    | Review changed files against project standards                                                               | New chat          | Uses project standards            |
| **6. Clean up**  | Delete or archive requirements, plan, tasks                                                                  | N/A               | Remove working documents          |

### Golden Rules

1. **One chat = one objective.** Close the chat when done. Start a new one.
2. **One phase at a time.** Don't ask for the entire feature in one shot.
3. **Review before accepting.** The agent assists: you decide.
4. **Clean ephemeral context.** Delete temporary docs when done.
5. **Evolve agent instructions.** When the agent makes a mistake, update its config.
6. **Focus the context.** Point the agent to relevant modules, not the entire project.
7. **Files over chat.** Let the agent generate documents as files, not chat messages.

### Output Token Budget

The agent has a limited number of tokens for output. This means:

| Request Size                            | Output Quality                                       |
| --------------------------------------- | ---------------------------------------------------- |
| "Generate one function with tests"      | High: full attention on one unit                     |
| "Generate the entire service layer"     | Medium: compressed, may skip edge cases              |
| "Generate the whole feature end-to-end" | Low: shortcuts, missing tests, inconsistent patterns |

**Divide and conquer.** Smaller, focused requests produce better code.

---

## 14. Validation Checklist

After setting up context engineering for your project, verify:

| Item                                                                                                  | Status |
| ----------------------------------------------------------------------------------------------------- | ------ |
| `apm.yml` declared with all agent primitives and committed                                            | [ ]    |
| `apm.lock.yaml` committed and `apm_modules/` in `.gitignore`                                          | [ ]    |
| `.apm/instructions/` and `.apm/contexts/` files written and committed                                 | [ ]    |
| Every instruction file has valid YAML frontmatter with `applyTo` field                                | [ ]    |
| `apm compile` run with explicit `--target` flag: generated files committed                            | [ ]    |
| Generated `AGENTS.md` reviewed for correctness by a developer                                         | [ ]    |
| Relevant skills from `anthropics/skills` declared in `apm.yml` and deployed via `apm install`         | [ ]    |
| `apm compile --target copilot` run and `.github/copilot-instructions.md` verified as generated output | [ ]    |
| At least one custom agent created (e.g., `project-developer` or `code-reviewer`)                      | [ ]    |
| Custom agent definitions in `.apm/agents/` delegate to `.apm/contexts/` files for project rules       | [ ]    |
| Context7 MCP server installed via `apm mcp install io.github.upstash/context7` and verified           | [ ]    |
| Tools assigned to custom agents (file system, Context7, terminal)                                     | [ ]    |
| `docs/` directory structure follows the recommended layout                                            | [ ]    |
| No stale working documents (old requirements, plans, tasks) in `docs/features/`                       | [ ]    |
| Team members understand the one-chat-one-objective rule                                               | [ ]    |
| First feature processed end-to-end with the new workflow                                              | [ ]    |

---

## Appendix A: Quick Reference: File Locations

```
Repository Root
├── AGENTS.md                          # Compiled: do not edit directly
├── CLAUDE.md                          # Compiled: do not edit directly
│
├── .apm/                              # Source primitives — your authoring surface
│   ├── instructions/                  # Always-on pointer files (.instructions.md)
│   ├── contexts/                      # On-demand rule files (.context.md)
│   ├── agents/                        # Agent definitions (.agent.md)
│   ├── prompts/                       # Reusable prompts (.prompt.md)
│   └── skills/                        # Custom skills (SKILL.md)
│
├── apm.yml                            # APM manifest: primitives, deps, MCP servers
├── apm.lock.yaml                      # Lockfile: commit this
│
├── .github/                           # Compiled/deployed by APM: do not edit directly
│   ├── copilot-instructions.md
│   ├── agents/
│   └── prompts/
│
├── .claude/                           # Compiled/deployed by APM: do not edit directly
├── .cursor/                           # Compiled/deployed by APM: do not edit directly
│
└── docs/
    ├── guidelines/                    # Coding standards, processes (human reference)
    ├── architecture/                  # System design, ADRs (human reference)
    ├── devops/                        # CI/CD, environments (human reference)
    └── features/                      # Per-feature working documents (ephemeral)
```

## Appendix B: Prompt Cheat Sheet

| Goal                            | Prompt                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bootstrap `.apm/` context files | "Analyze this project's codebase including file structure, existing patterns, dependencies, and build commands. For each concern (architecture, commit conventions, testing standards, coding standards), generate an instruction/context pair under `.apm/instructions/` and `.apm/contexts/`. Follow the primitive naming conventions in guides/setup/migrate-to-apm.md." |
| Create custom agent             | "Read the `.apm/contexts/` files for this project. Create a code-reviewer agent in `.apm/agents/code-reviewer.agent.md` that checks architecture compliance, test coverage, and coding conventions based on the rules documented in those context files."                                                                                                                   |
| Define feature requirements     | "Write requirements and acceptance criteria for [feature]. Include edge cases and out-of-scope boundaries. Save to `docs/features/<name>/requirements.md`."                                                                                                                                                                                                                 |
| Plan implementation             | "Read `docs/features/<name>/requirements.md`. Create an implementation plan following the architecture patterns documented in `AGENTS.md`. Save to `docs/features/<name>/plan.md`."                                                                                                                                                                                         |
| Generate a task list            | "Read `docs/features/<name>/plan.md`. Create an ordered task list with dependencies. Save to `docs/features/<name>/tasks.md`."                                                                                                                                                                                                                                              |
| Cross-check artifacts           | "Read the requirements, plan, and tasks in `docs/features/<name>/`. Identify contradictions, gaps, or missing acceptance criteria."                                                                                                                                                                                                                                         |
| Implement a task                | "Implement task #3 from `docs/features/<name>/tasks.md`. Follow the architecture and coding conventions in `AGENTS.md`. Write tests first."                                                                                                                                                                                                                                 |
| Review code                     | "Review the changes in `src/features/<name>/` against the project standards in `AGENTS.md`. Check architecture compliance, test coverage, and coding conventions."                                                                                                                                                                                                          |
| Check coverage                  | "Run tests for `src/features/<name>/` and generate missing tests to reach 80% coverage."                                                                                                                                                                                                                                                                                    |
| Update agent config             | "The agent keeps generating raw SQL instead of using the ORM. Find the relevant `.apm/contexts/` file (e.g. `coding-standards.context.md`) and add a rule that prohibits raw SQL and requires the ORM for all database operations. Then run `apm compile --target <your-targets>`."                                                                                         |

## Appendix C: Troubleshooting

| Problem                              | Cause                                                     | Fix                                                                                                                                                                                 |
| ------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent ignores project patterns       | `.apm/contexts/` files missing or too generic             | Add specific patterns and examples to the relevant context file, then run `apm compile --target <your-targets>`                                                                     |
| Agent uses outdated library APIs     | No MCP server configured                                  | Set up Context7 for live documentation                                                                                                                                              |
| Agent generates inconsistent code    | Stale working documents from a previous feature           | Delete completed feature docs from `docs/features/`                                                                                                                                 |
| Agent writes code in wrong directory | Architecture not documented                               | Add explicit directory structure to the relevant `.apm/contexts/` file, then run `apm compile --target <your-targets>`                                                              |
| Custom agent doesn't load            | Agent not deployed by APM or wrong file extension         | Verify the agent is authored in `.apm/agents/` with `.agent.md` extension and that `apm install` has been run                                                                       |
| MCP server not connecting            | Server not declared in `apm.yml` or `apm install` not run | Verify the MCP server is declared under `dependencies.mcp:` in `apm.yml` and run `apm install`. For manual fallback configs, check the harness-specific settings file for your IDE. |
| Agent produces low-quality output    | Request too large (whole feature at once)                 | Break into smaller, focused requests                                                                                                                                                |
| Agent contradicts itself             | Context window overflow                                   | Start a new chat; focus on one module                                                                                                                                               |