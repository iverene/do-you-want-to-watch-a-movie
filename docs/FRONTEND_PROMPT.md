# FRONTEND_PROMPT.md — "Do You Want to Watch a Movie?"

The build prompt for `frontend/`. Related docs: `docs/DESIGN.md`, `docs/REQUIREMENTS.md`, `docs/API.md`.

> **Revised Nov 25, 2026.** Where this prompt and the Nov 25 revisions disagree, follow `REQUIREMENTS.md` 1.1, `DESIGN.md` 1.1 and `API.md` 1.2. The checklist below has been updated. In short: no streaming providers, no watchlist reactions or sort, likes (S13) on the profile, scope is only Ours / Mine, the partner is visible only through their Profile, poster-only Home rows with a custom genre dropdown, a mini calendar on the left page, and a bigger binder.

## Role and goal

You are a senior frontend engineer. Build the complete frontend for **"Do You Want to Watch a Movie?"**, a private movie and series diary for exactly two people. Follow `docs/DESIGN.md` (the "Retro Minihome" design) exactly for look and layout, and this prompt for behavior, structure, the API and how to commit.

The app must **run fully without a backend**. All data access goes through a **services layer**: one service per resource (auth, screenings, watchlist, ...). Every service has two implementations with the same TypeScript interface:
- an **HTTP service** that calls the real REST API in section 7, and
- a **mock service** that answers from local sample data and follows the same rules.

Which set is used is decided in **one services config file**, not in environment variables. When the Express + Postgres backend is ready, switching to it is a one-line change in that file. No page or component may know which set it is using; they only import from `services/`.

## 1. Repository layout

The repo has three top-level folders. Create all three; this task fills in `frontend/` and `docs/` and leaves `backend/` as a documented placeholder.

```
/
├─ frontend/            # this app (React + Vite)
├─ backend/             # Express + Postgres API (built later, by a backend developer)
│  └─ README.md         # "Implements docs/API.md." + planned stack and how to run it
├─ docs/
│  ├─ DESIGN.md         # design spec (provided)
│  ├─ REQUIREMENTS.md   # requirements R1–R16, S1–S12 (export of the requirements doc)
│  ├─ API.md            # the API contract: copy section 7 of this prompt verbatim
│  └─ FRONTEND_PROMPT.md# this prompt
├─ .gitignore           # node_modules, dist, .env*, coverage, .DS_Store
└─ README.md            # what the project is, folder map, how to run the frontend
```

`docs/API.md` is the single source of truth shared by both sides. If the frontend needs a change to the contract, change `docs/API.md` and the types in the same commit.

## 2. Tech stack (use these)

- **React 18 + TypeScript + Vite** (in `frontend/`)
- **Tailwind CSS** (theme tokens mapped to CSS variables; see DESIGN.md §10)
- **React Router v6**
- **TanStack Query v5** for all server state (caching, loading, invalidation); hooks call services, never `fetch` directly
- **Zod** for validating HTTP responses in development and for form validation
- **React Hook Form** for forms
- **date-fns** for dates (week starts Monday for streaks)
- No UI kit and no mock-server library. Build the components in DESIGN.md §4 yourself; mocks are plain TypeScript services.

## 3. Running it

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173, mock services on by default
npm run build && npm run preview  # production build, still mock services
```

No `.env` file is needed. All service settings live in `frontend/src/services/config.ts`:

```ts
// frontend/src/services/config.ts
export const serviceConfig = {
  mode: 'mock' as 'mock' | 'http',   // 'mock' = local sample data, 'http' = real backend
  apiBaseUrl: '/api',                // used only in 'http' mode
  mockLatencyMs: 250,                // fake network delay so loading states are visible
  mockStorageKey: 'dywwam-mock-db-v1',
  timeZone: 'Asia/Manila',           // "today" for new watches and streak weeks
};
```

- In `http` mode, `vite.config.ts` proxies `/api` to `http://localhost:4000` during development.
- Mock data must **persist in `localStorage`** (under `mockStorageKey`) so logged watches, ratings and settings survive a reload. Settings shows a small "Reset demo data" link only when `mode === 'mock'`.
- Because the mocks are plain services (no service worker), the built app also works from `npm run preview` or any static host.

## 4. Mock users and seed data

Seed two users (both passwords `movienight2026`):

| username | displayName | avatar |
| --- | --- | --- |
| `alex` | Alex | `{style:'short', hair:0, skin:0, top:0, extra:'glasses'}` |
| `sam` | Sam | `{style:'long', hair:1, skin:1, top:1, extra:'none'}` |

(Real names are added later; never hard-code names in components. Always read them from `authService.me()` and `usersService.getProfile()`.)

Seed at least:
- **64 titles** in a mock catalog (46 movies, 18 series) with **original, made-up titles** (e.g. "Paper Moons", "The Quiet Harbor", "Night Bus 42"), years, genres, a 1–2 sentence overview, 3–5 made-up cast names, runtime, and `posterUrl: null`. The UI shows tinted placeholders when the poster is null.
- **24 screenings** spread over Aug–Nov 2026 (most watched together, a few solo), with ratings and comments from one or both users, including one rewatch and one series logged by season.
- **6 imported screenings** with `datePrecision: 'year'` (watched 2024–2025, no day).
- **10 watchlist items** (added by both users).
- A few liked titles (♥) for each user.
- A current streak of 6 weeks and a best streak of 9.
- Favorite genres for both users, and a Top 5 for each.

The mock movies service searches the catalog by title (case-insensitive, contains) and type. The mock recommendations service scores unwatched catalog titles by the users' genre ratings (simple weighted sum) and returns reasons such as "because you both rated Paper Moons 5 stars". Mock services throw the same `ApiError` (code, message, fields) the HTTP services throw, so error handling is identical.

## 5. Frontend structure

```
frontend/
  index.html
  vite.config.ts
  tailwind.config.ts
  package.json
  src/
    main.tsx                 # render <App/>
    app/
      router.tsx             # routes + auth guard
      providers.tsx          # QueryClient, ThemeProvider, AuthProvider
    services/
      config.ts              # serviceConfig (mode, apiBaseUrl, ...) — the only switch
      index.ts               # exports the active services: `export const services = serviceConfig.mode === 'mock' ? mockServices : httpServices`
      types.ts               # TS types for every request/response (section 7)
      schemas.ts             # Zod schemas mirroring types.ts
      errors.ts              # ApiError class + error codes
      contracts/             # one interface per resource, e.g. ScreeningsService
        auth.ts  users.ts  me.ts  home.ts  movies.ts  browse.ts  recommendations.ts
        screenings.ts  stats.ts  watchlist.ts  movieNights.ts  import.ts  projectionist.ts
      http/
        client.ts            # fetch wrapper: apiBaseUrl from config, JSON, credentials:'include', ApiError mapping
        *.http.ts            # one per contract, e.g. screenings.http.ts implements ScreeningsService
        index.ts             # httpServices object
      mock/
        db.ts                # in-memory DB + localStorage persistence + seed()
        seed.ts              # seed data
        session.ts           # mock session (current user id in localStorage)
        logic/               # streak, stats, taste match, recommendations, search, blind rating
        *.mock.ts            # one per contract, same interface as the http version
        index.ts             # mockServices object
    queries/                 # TanStack Query hooks that call `services.*`: useMe(), useScreenings(filters), ...
    components/
      binder/                # Binder, LeftPage, TabRail, MobileTabs, BinderHeader
      ui/                    # LogWatchButton, BevelButton, PixelIconButton, ArrowLink, Tag, Counter,
                             # SectionHeader, Segmented, Dropdown, Chip, Field, Toast, Skeleton
      media/                 # Poster, FramedPoster, PosterCard, StarRating, StarInput
      pixel/                 # PixelGrid, PixelAvatar, DuoAvatars, Flame, MiniTheater
      feedback/              # EmptyState, ErrorState, OfflineBar
      dialogs/               # PixelWindow, LogWatchDialog (steps), TopFivePicker, ConfirmDialog
      charts/                # PixelBarChart, MonthChart, BigNumber
      calendar/              # CalendarGrid
      comments/              # SpeechBubble, CommentForm
    pages/
      LoginPage.tsx  HomePage.tsx  WatchedListPage.tsx  WatchedCalendarPage.tsx  StatsPage.tsx
      TitleDetailPage.tsx  WatchlistPage.tsx  ProfilePage.tsx  SettingsPage.tsx  ImportPage.tsx
    hooks/                   # useScope(), useTheme(), useHotkey(), useMediaQuery()
    styles/
      tokens.css             # CSS variables for .theme-light / .theme-dark
      index.css              # Tailwind layers, grid-paper background, fonts
```

Example contract and usage:

```ts
// services/contracts/screenings.ts
export interface ScreeningsService {
  list(f: { scope: Scope; year?: number; genreId?: string; minStars?: number; type?: MediaType | 'all'; page?: number; pageSize?: number }): Promise<{ items: Screening[]; total: number }>;
  calendar(month: string, scope: Scope): Promise<{ days: { date: string; screenings: Screening[] }[]; undatedCount: number }>;
  get(id: string): Promise<{ screening: Screening; history: { id: string; watchedOn: string | null; watchedYear: number }[] }>;
  create(body: { titleId: string; watchedOn?: string; viewerIds?: string[]; season?: number }): Promise<{ screening: Screening }>;
  update(id: string, body: { watchedOn?: string; viewerIds?: string[]; season?: number }): Promise<{ screening: Screening }>;
  remove(id: string): Promise<void>;
  rate(id: string, body: { stars: 1|2|3|4|5; comment?: string }): Promise<{ screening: Screening }>;
}

// services/http/screenings.http.ts  → GET `${apiBaseUrl}/screenings?...` etc. (section 7)
// services/mock/screenings.mock.ts  → same results from mock/db.ts, after mockLatencyMs

// queries/screenings.ts
export const useScreenings = (f) => useQuery({ queryKey: ['screenings', f], queryFn: () => services.screenings.list(f) });
```

Each HTTP service method maps 1:1 to one endpoint in section 7, and its JSDoc names that endpoint (e.g. `/** GET /screenings */`).

## 6. Routes

| Path | Page | Auth |
| --- | --- | --- |
| `/login` | LoginPage | public (redirect to `/` if signed in) |
| `/` | HomePage | required |
| `/watched` | WatchedListPage | required |
| `/watched/calendar` | WatchedCalendarPage | required |
| `/watched/stats` | StatsPage | required |
| `/watched/:screeningId` | TitleDetailPage | required |
| `/watchlist` | WatchlistPage | required |
| `/profile/:username` | ProfilePage | required |
| `/settings` | SettingsPage | required |
| `/settings/import` | ImportPage | required |
| `*` | redirect to `/` | |

- Auth guard: call `services.auth.me()`; on an `UNAUTHORIZED` ApiError redirect to `/login?next=<path>`.
- The Log-a-watch dialog is global (not a route). Open it with the CTA, the `N` key, or `?log=1` in the URL.
- Scope (Ours / Mine) lives in the URL as `?scope=ours|mine` on Watched, Calendar and Stats, defaulting to `ours`. The partner's solo screenings are never shown; only their Profile is visible.

## 7. API contract

The contract (types, endpoints and behavior rules) lives in `docs/API.md`, which the backend must implement exactly. Section 7 of the original prompt was copied there verbatim.

## 8. Feature checklist (build all of it)

Login and session
- [ ] Login form (username, password, keep me signed in), error and rate-limit messages, no sign-up.
- [ ] Session restore via `/auth/me`; sign out in Settings.

Layout
- [ ] Desktop binder (≥1024 px) with header (counter, site title, **+ Log a watch**), left page, rings, right page, right-edge tabs.
- [ ] Mobile binder (<1024 px) with tabs along the top, **no bottom bar**; Home shows the streak card + duo avatars at the top.
- [ ] Left page: duo avatars, streak card, dotted divider, mini calendar of my watches (days link to the Watched calendar).
- [ ] Custom thin scrollbars; the header button is **+ Add to watchlist** on the Watchlist page.
- [ ] Light/dark themes via CSS variables; Light is the default; choice saved per user.

Home
- [ ] "Home" heading: For both / For me, All / Movies / Series, top pick panel with reason and actions (no streaming info), up to 12 more picks, refresh.
- [ ] Browse with a custom genre dropdown and rows: Trending, Because you watched …, New releases, Top rated, Because you watched … (never already-watched titles).
- [ ] All Home rows are poster-only, hide the horizontal scrollbar, show ◀ ▶ arrows while scrolling or hovering, and open a title preview.
- [ ] Recently watched (3) and Watchlist up next (2).

Watched
- [ ] List view: scope switch, filters (watched year, genre, stars, type), grouped by month, newest first, average stars only, comment counts, year-only imported group with "Rate it".
- [ ] Calendar view: month navigation, poster tiles per day, multi-title badge, undated note with link.
- [ ] Stats: scope, year and month filters, 4 big numbers, genre bars, top rated, by-month chart, undated note, best streak.
- [ ] Title detail: No. label, ♡ like, add to Top 5, framed poster, average, description, cast, watch history, rewatch, edit rating, change date, comments as speech bubbles (no "Write a comment" once I commented), blind rating.

Log a watch (global dialog)
- [ ] Search (debounced, type filter), select, watched-on date (default today, editable), who watched, season for series.
- [ ] Add manually (title, genres, type required; poster, year, description optional).
- [ ] Rate step: star input, optional comment, blind-rating note, save or skip.
- [ ] Same dialog in "watchlist mode" from the Watchlist page (adds to the watchlist instead, no rate step).

Watchlist
- [ ] Type filter, newest first, random pick (Spin), ✓ Watched (→ screening + rate step, card removed), plan a movie night, remove with a confirmation dialog.

Profile and settings
- [ ] Profile for either user: avatar, name, username, watched count, taste match, favorite genres, Top 5 (editable on own profile by typing a title, only watched titles), watchlist added by this user and Liked titles (clickable posters → preview), recently rated. No badges, no "Customize avatar" or "View [partner]'s profile" links.
- [ ] Settings: avatar maker (style, hair, skin, top, extra, shuffle, save), display name, favorite genres, light/dark, change password, import CSV, app toggles, sign out, reset demo data (mocks only).
- [ ] Import review page: matches, change match, add manually, skip, confirm.

## 9. Behavior details

- **Data fetching:** every page uses TanStack Query hooks from `src/queries`, and those hooks call `services.*` only. Mutations invalidate the right keys (e.g. logging a watch invalidates `home`, `screenings`, `calendar`, `stats`, `streak`, `recommendations`, `watchlist`).
- **Optimistic UI** for likes, ratings and watchlist removal; roll back on error with a toast.
- **Loading:** pixel skeletons (DESIGN.md §7). **Empty** and **error** states on every list.
- **Forms:** React Hook Form + Zod; show field errors from `error.fields` returned by the API.
- **Accessibility:** follow DESIGN.md §8 (keyboard, focus rings, labels, dialogs, reduced motion).
- **Performance:** lazy-load route pages; lazy-load poster images; keep the initial JS under ~250 kB gzipped.
- **No direct calls to TMDB or any AI service from the browser.** Everything goes through `/api`. The mocks simulate both.

## 10. Code quality

- TypeScript `strict: true`. No `any` in API code.
- Every API response is parsed with its Zod schema in development (`import.meta.env.DEV`).
- `frontend/README.md` covers setup, scripts, the services layer, how mock services work, and how to switch to the real backend (`serviceConfig.mode = 'http'`). The root `README.md` explains the three folders. `docs/API.md` holds the full contract (section 7), and `backend/README.md` points to it.
- ESLint + Prettier. Component files under ~200 lines; split when larger.
- Unit tests (Vitest) for the mock logic: streak, taste match, stats, blind rating, recommendation scoring, Top rated ranking and tie-breaks, browse exclusion, privacy (404 for the partner's solo screenings). A few React Testing Library tests for the Log-a-watch flow and the rating input.

## 11. Acceptance criteria

1. `npm install && npm run dev` opens the app with no backend running, and every page works with mock data.
2. You can sign in as `alex` or `sam`, log a watch by search and by manual entry, rate it, and see it immediately in Home, Watched (list and calendar), Stats and the streak.
3. Data persists across reloads (localStorage) and can be reset from Settings.
4. The blind-rating rule works when switching users (sign out, sign in as the other).
5. Desktop (1280 × 800) and mobile (390 × 844) match DESIGN.md: one binder layout, tabs on the right on desktop and along the top on mobile, no bottom bar, no side widget, no badges.
6. Light is the default theme, dark works on every page, and the choice survives a reload.
7. Changing `serviceConfig.mode` to `'http'` in `frontend/src/services/config.ts` sends the same calls to `apiBaseUrl` as the REST requests in `docs/API.md`, with no other code changes. No environment variables are required.
8. Keyboard-only use works for sign-in, logging a watch and rating.
9. The repo has `frontend/`, `backend/` (README placeholder) and `docs/` (DESIGN.md, REQUIREMENTS.md, API.md, FRONTEND_PROMPT.md), and the git history follows section 12.

## 12. Git and commit instructions

Work in git from the first minute and commit in small, working steps. Anyone reading the history should see the app grow one piece at a time.

**Setup**
1. Run `git init` at the repo root (not inside `frontend/`). The default branch is `main`.
2. First commit: `docs/` with DESIGN.md, REQUIREMENTS.md, API.md and FRONTEND_PROMPT.md. Message: `docs: add design, requirements, API contract and frontend prompt`.
3. Do the frontend work on a branch called `feat/frontend-mvp`. Merge it into `main` with a merge commit once the acceptance criteria pass.

**Commit message format** (Conventional Commits):

```
<type>(<scope>): <short summary, present tense, max 72 characters>

<optional body: what changed and why, wrapped at 72 characters>
<optional footer: Refs R8, R10>
```

- Types: `feat`, `fix`, `refactor`, `style` (formatting only), `test`, `docs`, `chore` (tooling, dependencies), `perf`.
- Scopes: `repo`, `frontend`, `services`, `mock`, `ui`, `theme`, `binder`, `auth`, `home`, `log-watch`, `watched`, `calendar`, `stats`, `detail`, `watchlist`, `profile`, `settings`, `import`, `streak`, `docs`, `api`.
- When a commit delivers a requirement, name its ID in the footer (`Refs R5, R7`).

**Rules**
- One logical change per commit. Every commit must build (`npm run build`) and pass `npm run lint` and `npm test`.
- Never commit `node_modules/`, `dist/`, `.env*`, coverage output or editor files.
- Never commit secrets. The frontend needs none: the services config holds no keys.
- If the API contract changes, update `docs/API.md`, `services/types.ts` and `services/schemas.ts` in the **same** commit (type `docs(api)` or `feat(services)`). Explain the change in the body for the backend developer.
- Never rewrite pushed history, and never force-push to `main`.

**Suggested commit sequence** (one or more commits per step):
1. `docs: add design, requirements, API contract and frontend prompt`
2. `chore(repo): add root README, .gitignore and backend placeholder`
3. `chore(frontend): scaffold Vite + React + TS + Tailwind, ESLint, Prettier, Vitest`
4. `feat(theme): add color tokens, fonts, grid-paper background and light/dark switch`
5. `feat(services): add types, Zod schemas, ApiError, contracts and config switch`
6. `feat(mock): add mock db, seed data, persistence and reset`
7. `feat(mock): add mock services and logic (streak, stats, taste match, blind rating, recommendations)`, then `test(mock): cover mock logic`
8. `feat(services): add http client and http services for every endpoint`
9. `feat(ui): add base components (buttons, tags, switches, dropdown, chips, fields, stars, posters)`
10. `feat(binder): add desktop binder, left page, tab rail, mobile binder and tabs`
11. `feat(auth): add login page, session restore and route guard` (Refs R1)
12. `feat(home): add recommendations, top pick, browse by genre, recent and up next` (Refs R2, R4)
13. `feat(log-watch): add search, manual add and rate steps` (Refs R8, R9, R10)
14. `feat(watched): add list view with scope and filters` (Refs R5)
15. `feat(calendar): add calendar view` (Refs R7)
16. `feat(stats): add stats page` (Refs R6)
17. `feat(detail): add title detail with ratings, comments and blind rating` (Refs R10, S2, S6)
18. `feat(watchlist): add watchlist, reactions, spin and watched flow` (Refs R11, R12, S1, S5, S8)
19. `feat(profile): add profile, Top 5 picker and recently rated` (Refs R13, R14)
20. `feat(settings): add avatar maker, genres, theme, password and app toggles` (Refs R13)
21. `feat(import): add CSV import review page` (Refs R15)
22. `feat(streak): add streak card to the left page and mobile Home` (Refs R16)
23. `test(frontend): add log-watch flow and rating input tests`
24. `docs(frontend): write frontend README`
25. Merge `feat/frontend-mvp` into `main`.
