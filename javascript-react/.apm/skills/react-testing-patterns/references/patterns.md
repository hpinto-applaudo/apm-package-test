# React Testing Patterns - Reference

Deep-context and edge-case patterns loaded on demand from `SKILL.md`. Match the
detected stack: use `vi.*` under Vitest, `jest.*` under Jest. Examples below
show both where the API differs.

## Mocking modules

Hoist module mocks to the top of the file; the runner lifts them above imports.
Reset call state in `beforeEach`, restore implementations in `afterEach`.

```ts
// Vitest
vi.mock('./api/userService', () => ({
  fetchUser: vi.fn(),
}));
import { fetchUser } from './api/userService';

beforeEach(() => {
  vi.mocked(fetchUser).mockResolvedValue({ id: '1', name: 'Ada' });
});
afterEach(() => {
  vi.restoreAllMocks();
});
```

```ts
// Jest
jest.mock('./api/userService');
import { fetchUser } from './api/userService';

beforeEach(() => {
  (fetchUser as jest.Mock).mockResolvedValue({ id: '1', name: 'Ada' });
});
afterEach(() => {
  jest.restoreAllMocks();
});
```

- Mock at the module boundary, not internal functions.
- Prefer asserting on observable output over `toHaveBeenCalled`; assert calls
  only when the call itself is the requirement (e.g. "submits the form").

## Fake timers

Enable in `beforeEach`, restore in `afterEach`, and advance with the runner's
API. With `user-event`, pass its `advanceTimers` option so interactions stay in
sync.

```ts
// Vitest
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

it('shows the toast after the delay', async () => {
  // Arrange
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const { getByRole } = getView();

  // Act
  await user.click(getByRole('button', { name: /save/i }));
  vi.advanceTimersByTime(3000);

  // Assert
  expect(getByRole('status')).toHaveTextContent(/saved/i);
});
```

Jest equivalent: `jest.useFakeTimers()` / `jest.useRealTimers()` /
`jest.advanceTimersByTime(...)`.

## Async queries: findBy and waitFor

- Use **`findBy*`** to await an element that appears asynchronously - it
  combines `getBy*` with `waitFor` and rejects after a timeout.
- Use **`waitFor`** to await an assertion that must eventually pass; keep the
  callback to a single expectation.
- Use **`waitForElementToBeRemoved`** for disappearance.
- Never `setTimeout`/sleep to wait for the DOM.

```ts
it('renders the user name after loading', async () => {
  // Arrange
  const { findByRole } = getView();

  // Act
  const heading = await findByRole('heading', { name: /ada/i });

  // Assert
  expect(heading).toBeInTheDocument();
});

it('removes the spinner once data arrives', async () => {
  // Arrange
  const { getByRole } = getView();

  // Assert
  await waitForElementToBeRemoved(() => getByRole('progressbar'));
});
```

## Network stubbing with MSW

Prefer MSW over mocking `fetch`/`axios` directly - it intercepts at the network
layer and survives refactors. Share the server across the file via `beforeAll`/
`afterAll`; reset handlers between tests.

```ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/user', () => HttpResponse.json({ id: '1', name: 'Ada' })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('shows an error when the request fails', async () => {
  // Arrange
  server.use(http.get('/api/user', () => new HttpResponse(null, { status: 500 })));
  const { findByRole } = getView();

  // Assert
  expect(await findByRole('alert')).toHaveTextContent(/something went wrong/i);
});
```

## Parametrized tests with it.each

Collapse repetitive variants into one table-driven test. Keep the name template
behavioral and reference the row fields.

```ts
it.each([
  { role: 'admin', canDelete: true },
  { role: 'viewer', canDelete: false },
])('renders the delete button as $canDelete for a $role', ({ role, canDelete }) => {
  // Arrange
  const { queryByRole } = getView({ role });

  // Assert
  expect(Boolean(queryByRole('button', { name: /delete/i }))).toBe(canDelete);
});
```

## Testing custom hooks with renderHook

Use `renderHook` from `@testing-library/react` for hooks with no component to
drive them. Wrap state updates in `act`; for async results, await `waitFor` on
the returned `result.current`.

```ts
import { renderHook, act, waitFor } from '@testing-library/react';

it('increments the count', () => {
  // Arrange
  const { result } = renderHook(() => useCounter(0));

  // Act
  act(() => {
    result.current.increment();
  });

  // Assert
  expect(result.current.count).toBe(1);
});

it('loads the user asynchronously', async () => {
  // Arrange
  const { result } = renderHook(() => useUser('1'));

  // Assert
  await waitFor(() => {
    expect(result.current.user?.name).toBe('Ada');
  });
});
```

When a hook depends on context, pass a `wrapper` to `renderHook` that provides
the required providers - mirror the providers the real app uses.
