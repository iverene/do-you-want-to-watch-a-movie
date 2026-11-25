# frontend/

The React app for "Do You Want to Watch a Movie?". It runs fully on mock data until the
backend exists. Look and layout follow [`docs/DESIGN.md`](../docs/DESIGN.md); the API it
talks to is [`docs/API.md`](../docs/API.md).

## Setup

Needs Node 20 or newer.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 — mock services, no backend needed
```

Sign in as **alex** or **sam**. Both passwords are `movienight2026`.

No `.env` file is needed, and the app uses no environment variables.

## Scripts

| Script                            | What it does                                                     |
| --------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                     | Vite dev server on port 5173                                     |
| `npm run build`                   | Type-check (`tsc -b`) and build to `dist/`                       |
| `npm run preview`                 | Serve the production build (still on mock services)              |
| `npm run lint`                    | ESLint, zero warnings allowed                                    |
| `npm run format` / `format:check` | Prettier                                                         |
| `npm test`                        | Vitest: mock logic, HTTP mapping, components and whole-app flows |

## How it's built

React 18 + TypeScript (strict) + Vite, Tailwind CSS, React Router 6, TanStack Query 5,
Zod, React Hook Form and date-fns. No UI kit: the components in DESIGN.md §4 are in
`src/components/`.

```
src/
  app/          router (lazy pages + auth guard), providers, the binder shell, global dialogs
  services/     the services layer (below)
  queries/      TanStack Query hooks; the only code that calls services.*
  components/   binder, ui, media, pixel, dialogs, charts, calendar, comments, and per-page parts
  pages/        one file per route
  hooks/        useScope, useTheme, useHotkey, useMediaQuery, useDebounced
  lib/          dates (Asia/Manila "today", ISO weeks) and formatting
  styles/       tokens.css (light/dark CSS variables) and index.css
  test/         test setup and renderApp(), which mounts the whole app on mock data
```

Colors are CSS variables on `.theme-light` / `.theme-dark` (`src/styles/tokens.css`), mapped
into Tailwind (`bg-paper`, `text-ink`, `border-line`, ...), so every class follows the theme.

## The services layer

Pages and components never call `fetch`. They use hooks from `src/queries/`, and those hooks
call `services.*` from `src/services/index.ts`:

```ts
export const services = serviceConfig.mode === 'mock' ? mockServices : httpServices;
```

- `services/contracts/` has one interface per resource (`ScreeningsService`, `WatchlistService`, ...).
- `services/http/` implements each contract against the REST API. Every method names its
  endpoint in JSDoc (`/** GET /screenings */`). `http/client.ts` adds `apiBaseUrl`, JSON,
  `credentials: 'include'`, and turns error bodies into `ApiError`. In development every
  response is checked against its Zod schema (`services/schemas.ts`) and a mismatch is logged.
- `services/mock/` implements the same contracts from local data (below).
- `services/types.ts` and `services/schemas.ts` mirror `docs/API.md`. Each schema is typed
  against its TS type, so the compiler catches drift between them.
- Both sets throw the same `ApiError` (`code`, `message`, `fields`), so error handling and
  form field errors work the same way in both modes.

## How the mock services work

- `mock/db.ts` keeps an in-memory database and saves it to `localStorage` under
  `serviceConfig.mockStorageKey` after every write, so logged watches, ratings and settings
  survive a reload. The first load seeds it from `mock/seed.ts`.
- **Reset demo data** in Settings (shown only in mock mode) puts the seed back.
- `mock/session.ts` stores the signed-in user id (localStorage with "Keep me signed in",
  sessionStorage without).
- `mock/logic/` holds the rules as pure, unit-tested functions: streak (ISO weeks in
  Asia/Manila), taste match, stats, blind rating, recommendation scoring, search,
  Top rated ranking, CSV parsing and import matching. The backend must follow the same rules
  (docs/API.md §4).
- Every call waits `serviceConfig.mockLatencyMs` (250 ms) so loading states are visible.
- Login locks for 15 minutes after 5 wrong passwords, like the real API will.
- Type `!offline` in the Log-a-watch search to see how the UI handles the movie API being
  down (`502 UPSTREAM`).

The seed is written around **Nov 24, 2026**: 64 made-up titles (46 movies, 18 series), 24
screenings from Aug to Nov 2026 (a rewatch, a series by season, a few solo), 6 year-only
imports from 2024–2025, 10 watchlist items, a 6-week streak (best 9), Top 5s, likes
and favorite genres. Old saved demo data is replaced automatically when the seed version changes. Viewed on a later date, the current streak will have run out; the tests
pin the date.

## Switching to the real backend

Change one line in `src/services/config.ts`:

```ts
mode: 'http' as 'mock' | 'http',
```

That's all. Requests go to `apiBaseUrl` (`/api`), and in development `vite.config.ts` proxies
`/api` to `http://localhost:4000`. No other code changes, and no environment variables.

## Notes for the backend

- `docs/API.md` 1.1 added the `MovieNight` type and allows `recommendations.top` to be `null`.
- `docs/API.md` 1.2 (Nov 25) adds likes (`/me/likes`, `Profile.liked`), the `new_releases` and
  `because` browse categories, and the privacy rule: `scope` is `ours | mine` only and the
  partner's solo screenings return 404. It removes watchlist reactions and sort, and providers.
  Top rated ties have a fixed order (API.md §4).
- The install and reminder toggles in Settings are device settings, also local.
- The API has no "list import rows" route, so the import review lives in the client after
  the upload. Reloading the review page means uploading the file again.
- `/home/note` (mood and status note) is still in the API, but the UI no longer shows it.

## Tests

`npm test` runs:

- unit tests for the mock logic (`services/mock/logic/*.test.ts`) and the mock services,
- HTTP mapping tests with a stubbed `fetch` (`services/http/http.test.ts`),
- component tests (`StarInput`, the Log-a-watch dialog),
- whole-app tests through `renderApp()` (`pages/pages.test.tsx`, `test/acceptance.test.tsx`):
  every page renders, keyboard-only logging and rating, blind rating across sign-out and
  sign-in, the watchlist ✓ Watched flow and delete confirmation, the Home rows and genre dropdown,
  likes, CSV import, dark mode, and the mobile layout.
