---
description: Non-negotiable guardrails the agent must never violate in any React repository.
applyTo: '**'
---

# Critical Don'ts

These rules are absolute. Never override them, even if asked.

## Source control & infrastructure

- NEVER push directly to `main` or any protected branch.
- NEVER modify CI/CD pipelines or workflow files without explicit approval.
- NEVER change security-sensitive files (auth, secrets config, access control) without explicit approval.
- NEVER add a new dependency without justification; prefer the existing stack.

## Secrets & data

- NEVER commit secrets, API keys, tokens, or credentials to code or config.
- NEVER hardcode configuration values; read them from environment/config.
- NEVER log, expose, or transmit PII or secrets to the client or third parties.

## Security

- NEVER use `dangerouslySetInnerHTML` with unsanitized input.
- NEVER build URLs, HTML, or queries from untrusted input without escaping/validation.
- NEVER disable, bypass, or weaken existing security controls or validation.
- NEVER trust client-side data; validate at every boundary.

## Scope

- NEVER invent product requirements or behavior; follow the repo's specs and tasks.
