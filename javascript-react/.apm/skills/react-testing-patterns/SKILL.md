---
name: react-testing-patterns
description: Use when creating, editing, or refactoring a React component, hook, or utility test file. Detects the repo's test stack (Jest/Vitest, React Testing Library, user-event) and applies reusable patterns - a getView render factory with element and action helpers, behavioral describe/it naming, AAA structure, and correct beforeEach/afterEach setup. Apply when the user asks to write tests, add coverage, or clean up an existing spec.
---

# React Testing Patterns

A craft guide for **physically structuring** a React test file. It covers the
file shape and reusable patterns only. It does **not** decide _what_ to test,
coverage thresholds, or quality gates - those belong to the project's testing
instruction. For bulk multi-file authoring, defer to the project's test-writer
agent.

## Step 1 - Detect the stack before writing anything

Never assume the toolchain. Inspect, in this order, and let every later choice
follow what you find:

1. **`package.json`** - identify the runner (`jest` vs `vitest`), the React
   Testing Library version, and whether `@testing-library/user-event` is
   installed.
2. **Test setup file** (`setupTests.*`, `vitest.setup.*`, `jest.config.*`,
   `vite.config.*` `test.setupFiles`) - determine whether `@testing-library/jest-dom`
   matchers are registered globally and whether globals (`describe`, `it`,
   `expect`) are exposed (Vitest `globals: true`) or must be imported.
3. **One or two sibling test files** - mirror the existing import style, file
   naming (`*.test.tsx` vs `*.spec.tsx`), and folder placement already in use.

Apply what you detect:

- **Imports** - if globals are not exposed, import `describe/it/expect` from
  `vitest`; if `jest-dom` is not global, import `@testing-library/jest-dom` in
  the file or rely on the existing setup file. Do not add imports that are
  already global.
- **Runner API** - use `vi.*` under Vitest, `jest.*` under Jest. Never mix.
- **Baseline idiom** - assume **React Testing Library + `user-event`**. Do not
  introduce Enzyme or `fireEvent`-first patterns. If no test stack exists at
  all, recommend Vitest + RTL + `user-event` but do not install anything
  without asking.

## Step 2 - Build a `getView` render factory

Every test file defines one `getView` factory that owns rendering, props, the
`user-event` instance, and reusable element/action helpers. Tests call it from
their own body - never from a hook.

```ts
const defaultProps: ComponentProps = {
  /* a complete, valid baseline */
};

function getView(overrideProps: Partial<ComponentProps> = {}) {
  const props = { ...defaultProps, ...overrideProps };
  const user = userEvent.setup();
  const utils = render(<Component {...props} />);

  // Element accessors - role-first, mirroring RTL query semantics.
  const getSubmitButton = () => screen.getByRole('button', { name: /submit/i });

  // Action helpers - wrap user-event and return its promise so tests await them.
  const clickSubmitButton = () => user.click(getSubmitButton());

  return { ...utils, user, props, getSubmitButton, clickSubmitButton };
}
```

Rules:

- **Signature** - `getView(overrideProps: Partial<Props> = {})` merges over a
  module-level `defaultProps`. Each test states only what differs.
- **Return shape** - spread the RTL result, then expose `user`, the resolved
  `props`, and named helpers.
- **Element accessors** (`get*`/`find*`/`query*`) follow RTL semantics: `get`
  throws when absent, `query` returns `null` (assert non-existence), `find` is
  async (awaitable). Prefer **`getByRole` with a `name`** to reinforce
  accessibility; fall back to label, then text, then `getByTestId` last.
- **Action helpers** (`click*`/`type*`/`submit*`) wrap the same `user` instance
  and **return the promise** so tests `await` them.

## Step 3 - Name and group with nested describes

Encode the three parts of a good test name across the structure (mental model:
_"should X when Y then Z"_), but write it as nested `describe` + behavioral `it`:

```ts
describe('LoginForm', () => {
  // (1) unit under test
  describe('when the form is invalid', () => {
    // (2) circumstance
    it('disables the submit button', () => {
      // (3) expected result
      /* ... */
    });
  });
});
```

- Top `describe` = the component/hook/util under test.
- Middle `describe('when ...')` = a shared precondition; its `beforeEach`
  arranges that scenario's state. Optional when there is no shared condition.
- `it('<verb-phrase> <outcome>')` reads as a sentence - no literal
  "should"/"then" keyword noise. The full path reads as the 3-part requirement.

## Step 4 - Allocate setup to the right hook

State isolation comes first. RTL auto-cleanup runs after each test - never call
`cleanup` manually.

| Hook         | Put here                                                              | Never here               |
| ------------ | --------------------------------------------------------------------- | ------------------------ |
| `beforeEach` | Re-init mutable `defaultProps`, `clearAllMocks()`, enable fake timers | A `getView` call         |
| `afterEach`  | Pair teardown: restore real timers, `restoreAllMocks()`               | Manual `cleanup`         |
| `beforeAll`  | Immutable, expensive, read-only setup (e.g. MSW `server.listen()`)    | Any mutable shared state |
| `afterAll`   | Symmetric global teardown (e.g. `server.close()`)                     | -                        |

Two hard rules:

1. **`getView` is called inside the test body** (in `// Arrange`), so each test
   controls its props and the render stays visible. A scenario `beforeEach` may
   arrange shared props/state but must not render.
2. **Never share mutable state through `beforeAll`** - mocks and props always
   reset in `beforeEach`.

## Step 5 - Structure every test with AAA

Mark each `it` block with `// Arrange`, `// Act`, `// Assert`:

```ts
it('disables the submit button while the form is invalid', async () => {
  // Arrange
  const { getSubmitButton, clickSubmitButton } = getView({ isValid: false });

  // Act
  await clickSubmitButton();

  // Assert
  expect(getSubmitButton()).toBeDisabled();
});
```

- **Arrange** - build override props, call `getView`, set up per-test mocks.
- **Act** - invoke a behavior helper or user interaction (awaited).
- **Assert** - `expect(...)` calls.
- **Exception** - a pure render/display test has no interaction. Collapse Act
  into Arrange and use only `// Arrange` + `// Assert`; do not emit an empty
  `// Act`.

## Deeper patterns

For mocking modules, fake timers, async `findBy`/`waitFor`, MSW network stubbing,
parametrized `it.each`, and testing custom hooks with `renderHook`,
**LOAD references/patterns.md**.
