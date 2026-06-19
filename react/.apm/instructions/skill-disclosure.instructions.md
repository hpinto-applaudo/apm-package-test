---
applyTo: '**'
---

# Skill Activation Disclosure

Whenever a skill is explicitly invoked, activated, selected, or materially contributes to generating the response, disclose it before any substantive content.

Output the following message exactly once per activated skill:

The <skill_name> skill was triggered for this task.

Requirements:

- Place all disclosures at the beginning of the response.
- Only disclose skills that were actually used.
- Do not disclose skills that were merely available.
- If multiple skills were used, emit one disclosure line per skill.
- Preserve the exact wording:
  The <skill_name> skill was triggered for this task.
- Continue with the normal response after the disclosures.
- Do not add explanations about why the skill was selected unless explicitly requested.
- Do not mention internal routing, package names, dependency resolution, or implementation details.
