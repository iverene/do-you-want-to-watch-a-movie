# API.md — "Do You Want to Watch a Movie?"

Version 1.2 · Nov 25, 2026

**Changelog.**
- 1.2: added likes (`/me/likes`, `Profile.liked`). Browse adds `new_releases` and `because` and never lists titles you watched. `Scope` is only `ours | mine`, and the partner's solo screenings return 404 (their profile is still public). Home counts are personal. Top rated ties are now broken by a fixed rule. Removed: watchlist reactions and sort, providers.
- 1.1: added the `MovieNight` type for `/movie-nights`; `top` in `/recommendations` may be `null`.

This is the REST contract between `frontend/` and `backend/`. It is the single source of truth: the frontend's HTTP services and mock services both follow it, and the backend must implement it exactly. If it changes, update this file and `frontend/src/services/types.ts` + `schemas.ts` in the same commit.

Requirement IDs (R1–R16, S1–S12) refer to `docs/REQUIREMENTS.md`.

## 1. General rules

- Base path `/api`. JSON in and out (`Content-Type: application/json`), except file uploads (`multipart/form-data`).
- Auth: an httpOnly session cookie set by `POST /api/auth/login`. The client always sends `credentials: 'include'`.
- Dates: `YYYY-MM-DD` for calendar dates, ISO 8601 for timestamps. IDs are strings (UUIDs).
- Errors: HTTP status + body `{ "error": { "code": string, "message": string, "fields"?: Record<string,string> } }`. Codes used: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `VALIDATION` (422), `RATE_LIMITED` (429), `CONFLICT` (409), `UPSTREAM` (502, movie API failed).
- Lists use `{ "items": T[], "total": number }` unless noted.

## 2. Types

```ts
type MediaType = 'movie' | 'tv';
type Scope = 'ours' | 'mine';                     // ours = screenings with both viewers; mine = every screening I was in
type Avatar = { style: 'short'|'long'|'bun'|'bob'; hair: 0|1|2|3; skin: 0|1|2|3; top: 0|1|2|3; extra: 'none'|'glasses'|'cap' };

interface User {
  id: string; username: string; displayName: string; avatar: Avatar;
  favoriteGenreIds: string[]; theme: 'light' | 'dark';
}
interface Genre { id: string; name: string }
interface Person { id: string; name: string; character?: string }
interface Title {                                    // a movie or series (cached from TMDB or manual)
  id: string; tmdbId: number | null; mediaType: MediaType; source: 'tmdb' | 'manual';
  title: string; year: number | null; overview: string | null; posterUrl: string | null;
  runtimeMinutes: number | null; seasons: number | null;
  genres: Genre[]; cast: Person[];                   // top ~10 billed
}
interface Rating { userId: string; stars: 1|2|3|4|5; comment: string | null; updatedAt: string }
interface Screening {
  id: string; number: number;                        // running "No." shown in the UI
  title: Title;
  watchedOn: string | null;                          // null for imported year-only
  watchedYear: number; datePrecision: 'day' | 'year';
  season: number | null;
  viewerIds: string[];                               // both ids = together; one = solo
  source: 'app' | 'import';
  addedBy: string; createdAt: string;
  ratings: Rating[];                                 // see blind rating rule below
  averageStars: number | null;                       // avg of visible ratings, 1 decimal
  commentCount: number;
  hiddenPartnerRating: boolean;                      // true when the partner rated but I haven't
}
interface WatchlistItem {
  id: string; title: Title; addedBy: string; addedAt: string;
}
interface Recommendation { title: Title; matchPercent: number; reason: string; forUserId: string | null }
interface MovieNight {                                // S8
  id: string; title: Title; proposedBy: string;      // proposedBy = user id
  date: string;                                      // YYYY-MM-DD
  status: 'proposed' | 'accepted' | 'declined'; createdAt: string;
}
interface Streak { current: number; best: number; lastWeeks: boolean[] }   // lastWeeks: oldest→newest, length 8
interface Stats {
  total: number; movies: number; series: number; together: number; solo: number;
  topGenre: { genre: Genre; count: number } | null;
  genres: { genre: Genre; count: number }[];        // sorted desc
  topRated: { screening: Screening; stars: number }[];
  tasteMatchPercent: number | null;
  byMonth: number[];                                 // 12 counts for the chosen year
  undatedCount: number;                              // year-only titles in the chosen year
  bestStreak: number;
}
interface Profile {
  user: User; watchedCount: number; tasteMatchPercent: number | null;
  topFive: (Screening | null)[];                     // length 5, position 1..5
  watchlistAdded: WatchlistItem[]; recentlyRated: Screening[];
  liked: Title[];                                    // ♥ titles, newest first; separate from Top 5
}
interface HomeSummary {
  todayCount: number; totalCount: number;            // the TODAY | TOTAL counter: screenings I was in
  mood: string; statusNote: string;                 // kept for compatibility; the UI no longer shows them
  streak: Streak;
  recentlyWatched: Screening[];                      // 3
  upNext: WatchlistItem[];                           // 2
}
interface ImportRow {
  id: string; rawTitle: string; watchedYear: number;
  match: Title | null; candidates: Title[]; status: 'matched' | 'needs_review' | 'manual' | 'skipped' | 'imported';
}
```

## 3. Endpoints

| Method | Path | Request | Response | Req. |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | `{username, password, remember: boolean}` | `{user: User}` + cookie | R1 |
| POST | `/auth/logout` | — | `204` | R1 |
| GET | `/auth/me` | — | `{user: User, partner: User}` | R1 |
| GET | `/users/:username` | — | `Profile` | R13, R14 |
| PATCH | `/me` | `{displayName?, theme?}` | `{user}` | R13 |
| PUT | `/me/avatar` | `Avatar` | `{user}` | R13 |
| PUT | `/me/genres` | `{genreIds: string[]}` | `{user}` | R13 |
| PUT | `/me/top-five` | `{screeningIds: (string\|null)[]}` (length 5, must be watched) | `{topFive}` | R13 |
| GET | `/me/likes` | — | `{items: Title[]}` newest first | S13 |
| PUT | `/me/likes/:titleId` | — | `204` (idempotent) | S13 |
| DELETE | `/me/likes/:titleId` | — | `204` (idempotent) | S13 |
| PUT | `/me/password` | `{currentPassword, newPassword}` (min 10) | `204` (other sessions ended) | R13 |
| GET | `/home` | — | `HomeSummary` | R2, R16 |
| PUT | `/home/note` | `{mood?, statusNote?}` | `{mood, statusNote}` | — |
| GET | `/genres` | — | `{items: Genre[]}` | — |
| GET | `/movies/search?q=&type=all\|movie\|tv` | — | `{items: Title[]}` (max 10) | R8, R11 |
| GET | `/movies/:titleId` | — | `{title: Title}` | R3 |
| POST | `/movies/manual` | multipart: `title`, `genreIds[]`, `mediaType`, `year?`, `overview?`, `poster?` (file) or `posterUrl?` | `{title: Title}` | R9 |
| GET | `/browse?category=trending\|top_rated\|new_releases\|because\|genre&genreId=&type=&titleId=` | — | `{items: Title[]}` (max 12; never titles I watched; `because` needs `titleId`) | R2 |
| GET | `/recommendations?for=both\|me&type=all\|movie\|tv` | — | `{top: Recommendation \| null, items: Recommendation[]}` (`top` is null when nothing is left to pick) | R4 |
| POST | `/recommendations/refresh` | `{for}` | same as GET | R4 |
| GET | `/screenings?scope=&year=&genreId=&minStars=&type=&page=&pageSize=` | — | `{items: Screening[], total}` newest first; year-only after dated in the same year | R5 |
| GET | `/screenings/calendar?month=YYYY-MM&scope=` | — | `{days: {date: string, screenings: Screening[]}[], undatedCount: number}` | R7 |
| POST | `/screenings` | `{titleId, watchedOn?: string (default today), viewerIds?: string[] (default both), season?: number}` | `{screening}` | R8 |
| GET | `/screenings/:id` | — | `{screening, history: {id, watchedOn, watchedYear}[]}` | R10, S6 |
| PATCH | `/screenings/:id` | `{watchedOn?, viewerIds?, season?}` | `{screening}` | R8 |
| DELETE | `/screenings/:id` | — | `204` | — |
| PUT | `/screenings/:id/rating` | `{stars: 1-5, comment?: string}` | `{screening}` | R10 |
| GET | `/stats?scope=&year=&month=` (month 1–12 or omitted) | — | `Stats` | R6 |
| GET | `/streak` | — | `Streak` | R16 |
| GET | `/watchlist?type=&addedBy=` | — | `{items: WatchlistItem[], total}` newest `addedAt` first | R11, R12 |
| POST | `/watchlist` | `{titleId}` | `{item}` (409 if already there) | R11 |
| DELETE | `/watchlist/:id` | — | `204` | R11 |
| POST | `/watchlist/:id/watched` | `{watchedOn?, viewerIds?}` | `{screening}` (item removed) | R11 |
| GET | `/watchlist/random?type=&genreId=&maxRuntime=` | — | `{item}` | S1 |
| GET | `/movie-nights` · POST `/movie-nights` · PATCH `/movie-nights/:id` | `{titleId, date}` / `{status: 'accepted'\|'declined'}` | `{items: MovieNight[]}` / `{night: MovieNight}` | S8 |
| POST | `/import` | multipart `file` (CSV: `title,year` + optional `type,who,stars_a,stars_b`) | `{rows: ImportRow[]}` | R15 |
| PATCH | `/import/rows/:id` | `{matchTitleId?: string, status?: 'skipped'\|'manual'}` | `{row}` | R15 |
| POST | `/import/confirm` | — | `{imported: number, skipped: number}` | R15 |
| POST | `/projectionist` | `{message: string}` | `{reply: string, picks: Recommendation[]}` | S11 |
| GET | `/wrapped?year=` | — | `{stats: Stats, highlights: string[]}` | S9 |

## 4. Behavior rules

The frontend's mock services follow these too, so the real backend must match them.

**Blind rating rule (S2):** when user X requests a screening and the partner has rated but X has not, the partner's rating is **omitted** from `ratings`, `hiddenPartnerRating` is `true`, and `averageStars` uses only visible ratings. Once X rates, both are returned.

- `POST /screenings` without `watchedOn` uses today's date in **Asia/Manila** time.
- Streak = consecutive ISO weeks (Mon–Sun) ending this week or last week with ≥ 1 screening whose `viewerIds` contains both users and `datePrecision='day'`. `lastWeeks` covers the 8 most recent weeks.
- Taste match = share of titles both rated where the two ratings differ by ≤ 1 star, as a percent.
- "Top rated" in `ours` = average of the visible ratings; in `mine` = my stars. Each title appears once (its best screening). Ties are ordered by, in turn: more visible ratings (rated by both first), more recent watch (year-only imports count as Jan 1), then title A–Z.
- **Privacy (R13):** each user sees only screenings they were in. `GET/PATCH/DELETE /screenings/:id` and `PUT /screenings/:id/rating` return `404 NOT_FOUND` for a screening that only the partner watched, and `scope` other than `ours`/`mine` is `422 VALIDATION`. The partner's profile (`GET /users/:username`) stays visible, including Top 5, watchlist adds, likes and recent ratings.
- Home `todayCount`/`totalCount` count screenings I was in.
- Browse never lists a title I have watched. `because` returns titles sharing a genre with `titleId`, most shared genres first.
- The watchlist is shared; it lists newest first.
- Top 5 accepts only titles the user has watched (422 otherwise).

## 5. Backend implementation notes

These are not part of the wire contract, but the frontend relies on them.

**Stack.** Node.js + Express, PostgreSQL (Prisma or Drizzle). Serve on port `4000`; the frontend dev server proxies `/api` there.

**Auth and security (R1).**
- Exactly two users, created by a seed script. There is no sign-up route.
- Passwords hashed with argon2 or bcrypt. Sessions stored server-side (e.g. a `sessions` table) and sent as an `httpOnly`, `Secure`, `SameSite=Lax` cookie.
- "Keep me signed in" = 30-day session; otherwise the session ends when the browser closes.
- Rate-limit `POST /auth/login`: 5 failed attempts per 15 minutes per IP → `429 RATE_LIMITED`.
- Every route except `POST /auth/login` returns `401 UNAUTHORIZED` without a valid session.
- `PUT /me/password` deletes the user's other sessions.
- Send `X-Robots-Tag: noindex` on every response.

**Time and dates.** "Today" and week boundaries use the `Asia/Manila` time zone. Weeks start on Monday (ISO weeks).

**Movie data (R3).** Use TMDB (movies and TV). The browser never calls TMDB; search and details go through the backend, which caches titles in the `movies` table (unique on `tmdb_id` + `media_type`). If TMDB fails, return `502 UPSTREAM`; the frontend offers manual entry.

**Uploads.** Only manual posters are uploaded (`POST /movies/manual`). Store them in object storage and save the URL. Avatars are settings (JSON), not images.

**Recommendations (R4).** Build ~40 candidates from TMDB (similar to 4–5 star titles, discover by top genres, liked cast, trending), drop watched and watchlist titles, score them (genre affinity, similarity to loved titles, cast affinity, both-liked bonus, penalty for titles similar to 1–2 star ratings), then ask an LLM to pick and order 20 and write a one-line reason each, returning JSON. Cache results in a `recommendations` table and refresh after a new rating or daily. Imported titles count as taste signals.

**Computed values.**
- Streak (R16): consecutive ISO weeks ending this week or last week with at least one screening where both users are viewers and `datePrecision = 'day'`. Solo and year-only screenings don't count. Keep the best streak.
- Taste match (S3): of the titles both users rated, the share where the ratings differ by at most 1 star, as a whole percent.
- Top rated: see section 4 (one entry per title; ties by number of ratings, then latest watch, then title).
- Blind rating (S2): see section 4.
- Screening list order: newest `watchedOn` first; within a year, year-only screenings come after dated ones.

**Data model.** The table list (users, genres, movies, movie_genres, people, movie_cast, screenings, screening_viewers, ratings, watchlist_items, likes, movie_nights, top_five, recommendations, import_rows, couple_stats, home_notes, sessions) is in `docs/REQUIREMENTS.md` §7.
