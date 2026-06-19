# APM Package Test - Monorepo with React and Node at Repository Root

## Initial Structure

Assume we are already inside:

```text
apm-package-test/
```

---

# Step 1 - Create the Packages

Create the package directories:

```bash
mkdir react

mkdir node
```

Expected structure:

```text
apm-package-test/
├── react/
└── node/
```

---

# Step 2 - Initialize React

Move into the React package:

```bash
cd react
```

Initialize the package:

```bash
apm init react
```

If `apm init` is unavailable, create the structure manually:

```bash
mkdir .apm

touch apm.yml
```

Expected structure:

```text
react/
├── apm.yml
└── .apm/
```

---

# Step 3 - Create React Skill

Create the skill folder:

```bash
mkdir -p .apm/skills/react-review
```

Create:

```text
.apm/skills/react-review/SKILL.md
```

Content:

```markdown
---
name: react-review
description: React review standards
---

# React Review

Review:

- Hooks
- Accessibility
- Memoization
- Performance
```

---

# Step 4 - Configure React External Dependency

Edit:

```text
react/apm.yml
```

Content:

```yaml
name: react
version: 1.0.0

dependencies:
  apm:
    - anthropics/skills/skills/frontend-design#v1.0.0
```

React now contains:

- Local skill: `react-review`
- External dependency: `frontend-design`

---

# Step 5 - Create Node

Move into the Node package:

```bash
cd ../node
```

Create package structure:

```bash
mkdir .apm

mkdir -p .apm/skills/node-review
```

Create:

```text
.apm/skills/node-review/SKILL.md
```

Content:

```markdown
---
name: node-review
description: Node review standards
---

# Node Review

Review:

- Security
- Validation
- Logging
- Error handling
```

---

# Step 6 - Configure Node External Dependency

Edit:

```text
node/apm.yml
```

Content:

```yaml
name: node
version: 1.0.0

dependencies:
  apm:
    - anthropics/skills/skills/security-review#v2.1.0
```

Node now contains:

- Local skill: `node-review`
- External dependency: `security-review`

---

# Step 7 - Package React

Move back to React:

```bash
cd ../react
```

Validate:

```bash
apm pack --dry-run
```

Build:

```bash
apm pack
```

Expected output:

```text
build/
└── react/
```

---

# Step 8 - Package Node

Move to Node:

```bash
cd ../node
```

Build:

```bash
apm pack
```

Expected output:

```text
build/
└── node/
```

---

# Step 9 - Configure Automatic React Release Workflow

Create:

```text
.github/workflows/react-release.yml
```

Content:

```yaml
name: React Release

on:
  push:
    paths:
      - 'react/**'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Pack
        run: |
          cd react
          apm pack
```

---

# Step 10 - Configure Changesets

Install:

```bash
pnpm add -D @changesets/cli
```

Initialize:

```bash
npx changeset init
```

Create a changeset:

```bash
npx changeset
```

Select:

```text
react
```

Select:

```text
minor
```

This generates:

```text
.changeset/
```

---

# Step 11 - Create Independent Tags

React release:

```bash
git tag react-v1.1.0

git push origin react-v1.1.0
```

Node release:

```bash
git tag node-v1.0.1

git push origin node-v1.0.1
```

---

# Step 12 - Consumer Installs React

Consumer `apm.yml`:

```yaml
dependencies:
  apm:
    - company/apm-package-test/react#react-v1.1.0
```

Install:

```bash
apm install
```

Expected installed skills:

```text
skills/
├── react-review
└── frontend-design
```

---

# Step 13 - Consumer Installs Node

Consumer `apm.yml`:

```yaml
dependencies:
  apm:
    - company/apm-package-test/node#node-v1.0.0
```

Install:

```bash
apm install
```

Expected installed skills:

```text
skills/
├── node-review
└── security-review
```

---

# Final Structure

```text
apm-package-test/
├── react/
│   ├── apm.yml
│   └── .apm/
│
├── node/
│   ├── apm.yml
│   └── .apm/
│
├── .changeset/
│
└── .github/
    └── workflows/
```

With this structure:

- React and Node live directly at the repository root.
- Each package has its own version.
- Each package can be released independently.
- Each package can define different external APM dependencies.
- Consumers automatically receive both local skills and transitive dependencies.
- Changesets can manage version bumps independently.
- Git tags can be package-specific (`react-vX.Y.Z`, `node-vX.Y.Z`).