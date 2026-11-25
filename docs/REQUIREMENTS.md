# REQUIREMENTS.md — "Do You Want to Watch a Movie?"

Version 1.1 · Nov 25, 2026

**Changelog.** 1.1 (Nov 25 revisions): Home renamed and rebuilt as poster rows (with "Because you watched …"); streaming providers (S4) and watchlist reactions (S5) removed; likes (S13) shown on the profile; delete confirmation on the watchlist; new privacy rule: only the partner's Profile is visible; Watched cards show the average rating only; Top 5 picked by typing; mini calendar on the left page instead of the mood note.

"Do You Want to Watch a Movie?" is a private, two-person diary for movies and TV series. You log what you watched, rate it, keep a shared watchlist, and get AI picks tuned to both of your tastes. Nobody else can sign up or see anything.

Related docs: `docs/DESIGN.md` (look and layout), `docs/API.md` (REST contract), `docs/FRONTEND_PROMPT.md` (frontend build prompt).

---

## 1. Overview

| Item | Decision |
| --- | --- |
| Users | Exactly 2 accounts, created by a seed script; no public sign-up |
| Content | Movies **and** TV series ("titles" in this doc means both) |
| Frontend | React (Vite) + TypeScript + Tailwind CSS, React Router, TanStack Query; services layer with mock and HTTP implementations |
| Backend | Node.js + Express (REST, JSON) |
| Database | PostgreSQL (Prisma or Drizzle) |
| Movie data | TMDB API for movies and series (search, posters, genres, cast, year), with manual fallback |
| AI | An LLM re-ranks TMDB candidates and writes the reason for each pick |
| Region | Time zone `Asia/Manila` |
| Design | "Retro Minihome" (see `DESIGN.md`); light mode by default, dark mode in Settings |
| Repo | `frontend/`, `backend/`, `docs/` |

**Guiding principle: shared first, personal second.** Every page opens on the shared view ("Ours"): titles you watched together, your combined ratings, joint picks. Each person can switch to a personal view ("Mine"), but the shared view is always the default and the most prominent.

Requirement IDs R1–R14 map to the original brief. R15 (importing past watches) and R16 (streak) were added on Nov 24. Approved extra features are S1–S13 (section 5).

---

## 2. Pages and navigation

| Route | Page | Purpose |
| --- | --- | --- |
| `/login` | Login | Only public page; two-account sign-in |
| `/` | Home | AI picks, browse by genre, recently watched, up next |
| `/watched` | Watched (list) | Watched titles with ratings, newest first, filters |
| `/watched/calendar` | Watched (calendar) | Month grid of poster tiles |
| `/watched/stats` | Stats | Totals, top genre, top rated, by month; month/year filter |
| `/watched/:id` | Title detail | Average rating, each user's stars and comments |
| `/watchlist` | Watchlist | Titles to watch, who added each |
| `/profile/:username` | Profile | Own or the other user's profile |
| `/settings` | Settings | Avatar, name, genres, theme, password, import |
| `/settings/import` | Import | One-time review of imported past watches (R15) |

- **Navigation:** binder tabs on the right on desktop and along the top on mobile (Home, Watched, Watchlist, Profile, Settings). No bottom bar on mobile.
- **Main action:** an orange **+ Log a watch** button at the top of every signed-in page, desktop and mobile. It opens the search dialog.
- **Page name:** "Watched" (alternative under consideration: "Diary"; see section 8).

---

## 3. Functional requirements

Each item is an acceptance criterion.

### 3.1 Access (R1)

**R1 — Private to two users.**
- [ ] Exactly two user accounts exist, created by a seed script; there is no sign-up route or link.
- [ ] Every page and API route except `/login` requires a valid session; anything else returns 401 or redirects to login.
- [ ] Passwords are hashed with argon2 or bcrypt; the session is an httpOnly, Secure, SameSite cookie.
- [ ] Login is rate-limited (5 attempts per 15 minutes per IP), and the site sends `noindex` so search engines skip it.
- [ ] Login page: username, password and "keep me signed in"; a note that only two people have a key.

### 3.2 Home (R2, R4)

- [ ] The page heading is **Home** (no tagline). Recommendations come first, with switches *For both / For me* (default For both) and *All / Movies / Series*.
- [ ] **Top pick**: one AI pick with poster, title, year, genre, runtime, a one-line reason (e.g. "because you both gave [Title] five stars"), chips (match %, genre, cast), and actions *Add to watchlist*, *Mark as watched*, *Spin instead*.
- [ ] **More picks**: a row of up to 12 AI picks. Refreshable.
- [ ] **Browse**: a custom genre dropdown (not a wall of chips) filters these rows: *Trending*, *Because you watched [a title I rated 4–5★]*, *New releases*, *Top rated*, and a second *Because you watched …* row.
- [ ] Every row on Home shows **posters only** (the title is in the tooltip and for screen readers). Clicking a poster opens a preview with details, ♥ like, *Add to watchlist* and *Mark as watched*.
- [ ] Rows scroll sideways with no visible scrollbar. ◀ ▶ arrows appear while scrolling or hovering, and only on a side with more to see.
- [ ] **Recently watched** (3, newest first) and **Watchlist up next** (2, with who added them).
- [ ] Titles I have already watched never appear in recommendations or in any Browse row.
- [ ] No greetings ("Good evening") and no "tonight" wording.

### 3.3 Watched (R5, R7)

**R5 — List view.**
- [ ] Shows every watched title with poster, title, watch date, comment count, and the **average** stars (or "rate to reveal" / "not rated").
- [ ] Sorted by watch date, newest first, grouped by month.
- [ ] View switch: **Ours** (default: titles watched together) and **Mine** (everything I watched, solo included). The partner's solo watches are never shown (privacy, see 3.7).
- [ ] Filters: watched year, genre (multi-select), stars (e.g. 4+), type (Movies / Series / All). Filters combine.
- [ ] Imported titles that only have a watched year (R15) appear after the dated titles of that year, labeled with the year instead of a date, with a *Rate it* button if unrated.

**R7 — Calendar view.**
- [ ] *List / Calendar* switch on the Watched page.
- [ ] A month grid like Instagram's archive calendar: each day with a watch shows that title's poster as the tile; several titles on one day show a stacked tile with a count.
- [ ] Month navigation with arrows (and swipe on mobile); tapping a tile opens the title (or a list if there are several).
- [ ] Imported year-only titles are not on the calendar; a note says "+ N titles without a date" and links to the filtered list.

### 3.4 Stats (R6)

- [ ] Opened from a *Stats* button on the Watched page.
- [ ] Shows total watched (movies vs series), most-watched genre, and top-rated titles.
- [ ] Filter by month and year (and "all").
- [ ] Scope switch: **Ours** (default) or **Mine**. "Top rated" uses the average in Ours and my own stars in Mine.
- [ ] Top rated lists each title once. Ties are broken by: rated by both before rated by one, then the more recent watch, then title A–Z.
- [ ] Also shows taste match, together vs solo, a by-month chart for the chosen year, and the best streak (R16).
- [ ] Year filters include imported year-only titles; month filters can't place them, so they're counted under "No date" for that year.

### 3.5 Logging a watch (R8, R9, R10)

**R8 — Search and add.**
- [ ] The **+ Log a watch** button opens a dialog (bottom sheet on mobile).
- [ ] Search queries the movie API as you type (debounced ~300 ms) and shows poster, title, year, type (Movie / Series) and top cast. A type filter narrows to Movies or Series.
- [ ] Selecting a result saves it with title, poster, description, genres, year and top cast.
- [ ] The watch date is set automatically to today (editable).
- [ ] "Who watched?" defaults to **Both of us**; it can be switched to just me.
- [ ] A series can be logged as a whole or by season.

**R9 — Manual fallback.**
- [ ] "Can't find it? Add it manually" opens a form: title (required), poster (upload or image link), genre(s) (required), type, and optional year and description.

**R10 — Rate and comment.**
- [ ] After saving, a rating step asks the current user for 1–5 stars and an optional comment; it can be skipped.
- [ ] Each user rates separately. The other user sees a "Rate it" badge until they rate.
- [ ] Opening a watched title shows the average rating plus each user's stars and comment (as speech bubbles). The *Write a comment* prompt is hidden once I have commented.
- [ ] A ♥ button on the title likes it; liked titles show on my profile (separate from Top 5).
- [ ] Blind rating (S2): the partner's stars stay hidden until you've rated.

### 3.6 Watchlist (R11, R12)

- [ ] Add titles via the same search (and manual fallback).
- [ ] **+ Add to watchlist** is the main orange button in the header on this page (in place of *Log a watch*).
- [ ] Each card shows who added it (avatar + name) and when. Newest first.
- [ ] Each card has a **✓ Watched** button: it logs the title in Watched with today's date, removes the card from the Watchlist, and opens the rating step.
- [ ] Filter: type. The watchlist is shared by both users.
- [ ] Removing a card asks for confirmation first.
- [ ] Spin (S1) and plan a movie night (S8) are available on each card or in the toolbar.

### 3.7 Profile and settings (R13, R14)

- [ ] Profile shows name, pixel avatar, username, watched count, taste match with the partner, favorite genres, Top 5, the titles this user added to the watchlist, **Liked** titles (♥, S13), and recently rated titles. Every poster opens a title preview.
- [ ] Top 5 is picked and ordered by the user, only from titles in Watched, by typing a title (type-to-search).
- [ ] Either user can open the other's profile (read-only). **The Profile is the only part of the partner's activity that is visible**: Home, Watched, Calendar and Stats show only my own and shared screenings, and the partner's solo watches are hidden everywhere else (the API returns 404).
- [ ] No badges on profiles (removed Nov 24).
- [ ] Settings: display name, pixel avatar, favorite genres (multi-select from the API's genre list), appearance (Light default / Dark), change password, import past watches, app options (install, reminders), sign out.
- [ ] **Avatar maker:** hair style (short, long, bun, bob), hair color, skin tone, top color and one extra (none, glasses, cap), with a live preview, Shuffle and Save. No photo upload. The avatar shows on Profile, ratings, comments, Home and Login.
- [ ] Favorite genres feed the AI recommendations.
- [ ] **Change password:** current password, new password (min. 10 characters) and confirm; on success, that user's other sessions are signed out.

### 3.8 Importing past watches (R15)

You have a list of titles with the year each was watched. It is loaded once so that history counts everywhere except the calendar.

- [ ] Import from a CSV or spreadsheet with at least two columns: title and watched year. Optional columns: type (movie/series), who watched (both / user), stars per user.
- [ ] Each row is matched to TMDB automatically (title search, preferring titles released on or before the watched year).
- [ ] A review screen shows each match with its poster; unclear or missing matches can be re-picked, entered manually (R9) or skipped.
- [ ] Confirmed rows become watched entries with the watched year only (no day); "who watched" defaults to both.
- [ ] Imported titles appear in the Watched list, filters, Stats (year level), title detail, Top 5 choices and AI signals, but not on the calendar.
- [ ] Imported titles without stars show a "Rate it" badge.
- [ ] Re-running the import skips titles already imported.

### 3.9 Streak (R16)

A shared streak sits on the left page of the binder (and at the top of Home on mobile), so you both see how consistent your movie nights are.

- [ ] Counts consecutive weeks (Monday to Sunday, Asia/Manila) with at least one title watched together.
- [ ] Shows the current streak with a pixel flame and the last 8 weeks as filled or empty blocks.
- [ ] Breaks after a full week with no shared watch; solo watches and imported year-only titles don't count.
- [ ] The best streak is kept and shown in Stats.

---

## 4. AI recommendations (R4)

Recommendations use a hybrid approach: TMDB supplies real, existing titles as candidates, simple scoring narrows them, and an LLM does the final ranking and writes the reason. This keeps the AI from inventing titles and keeps costs low (one LLM call per refresh).

**Flow:**
1. **Taste signals:** stars from both users, genres of watched titles, cast of highly rated titles, favorite genres on profiles.
2. **Candidates from TMDB:** similar to 4–5 star titles, discover by top genres, titles with liked actors, trending as a fallback.
3. **Filter and score:** drop watched and watchlist titles; score; keep the top ~40.
4. **AI re-rank (LLM):** picks 20 plus one top pick for both of you, writes a one-line reason each, returns structured JSON.
5. **Cache in Postgres:** refresh after a new rating, or once a day.
6. **Home:** top pick, Recommended row, per-genre rows.

**Scoring weights (starting point):**

| Signal | How it's measured | Weight |
| --- | --- | --- |
| Genre affinity | Average stars per genre across both users, plus favorite genres | High |
| Similar to loved titles | Candidate came from TMDB "recommendations" of a 4–5 star title | High |
| Cast affinity | Shares actors with titles rated 4+ | Medium |
| Both-liked bonus | Matches something both users rated 4+ | Medium |
| Low-rated penalty | Similar to titles either user rated 1–2 | Negative |
| Popularity / quality | TMDB vote average and count | Low (tie-breaker) |

Picks are made "for both" by default, with a "For me" toggle. Titles watched together weigh more in shared picks; solo watches weigh more in that person's picks. Movies and series share one taste profile. Imported titles count as taste signals from day one.

---

## 5. Approved additional features

| # | Feature | What it does | Status |
| --- | --- | --- | --- |
| S1 | "Can't decide" spinner | Random pick from the shared watchlist, filtered by genre, type or runtime | Approved |
| S2 | Blind rating | The other person's stars stay hidden until you've rated too | Approved |
| S3 | Taste match % | Per title and overall ("you agree 82% of the time"); also an AI signal | Approved |
| S4 | Where to stream | Streaming providers for the Philippines from TMDB | Removed Nov 25 |
| S5 | Watchlist reactions | The other user reacts (want / maybe / nah); both-want titles rise to the top | Removed Nov 25 |
| S6 | Rewatch support | Log the same title again; history shows every date | Approved |
| S7 | Watched together vs solo | "Who watched?" on every entry; powers the Ours / Mine views | Approved |
| S8 | Movie-night planner | Propose a date + title, the other accepts | Approved |
| S9 | Year-in-review "Wrapped" | A shared recap each December, with a personal page each | Approved |
| S10 | Milestones and badges | Removed Nov 24; replaced by the shared streak (R16) | Rejected |
| S11 | Ask the projectionist | Chat with the AI ("something cozy under 2 hours") | Approved |
| S12 | Installable app (PWA) | Home-screen app on both phones, with push reminders | Approved |
| S13 | Likes | ♥ any title; liked titles are listed on the profile, separate from Top 5 | Approved (Nov 25) |

---

## 6. Non-functional requirements

- **Privacy:** no public pages besides login; `noindex`; API keys (TMDB, LLM) only on the server.
- **Performance:** Home loads in under 2 s on a mid-range phone over 4G; search results in under 1 s after typing stops.
- **Accessibility:** keyboard access everywhere, visible focus, 44 px touch targets, text contrast 4.5:1, labels on icon buttons and stars (see `DESIGN.md` §8).
- **Responsive:** desktop (≥ 1024 px) and mobile (360–430 px) layouts.
- **Themes:** light by default; dark mode chosen in Settings and saved per user.
- **Offline-tolerant:** the app shows an offline bar and doesn't lose a form in progress.
- **Frontend without backend:** the frontend runs fully on mock services until the backend is ready (see `FRONTEND_PROMPT.md`).

---

## 7. Data model (PostgreSQL)

Titles are cached locally once fetched, so the app keeps working if the movie API is slow, and manual entries live in the same table. A watched entry ("screening") can be shared or solo; each user rates it separately.

| Table | Key columns | Notes |
| --- | --- | --- |
| `users` | id, username, display_name, avatar (JSON: style, hair, skin, top, extra), theme, password_hash, created_at | Seeded with 2 rows |
| `user_fav_genres` | user_id, genre_id | Many-to-many |
| `genres` | id, tmdb_genre_id (nullable), name | Synced from TMDB genre lists |
| `movies` | id, tmdb_id (nullable), media_type (movie / tv), title, overview, poster_url, release_year, runtime_minutes, seasons, source (tmdb / manual), created_by | Unique on (tmdb_id, media_type) |
| `movie_genres` | movie_id, genre_id | |
| `people` / `movie_cast` | people: id, tmdb_person_id, name · cast: movie_id, person_id, character, billing_order | Top ~10 billed |
| `screenings` | id, number, movie_id, watched_on (date, nullable), watched_year, date_precision (day / year), season (nullable), source (app / import), added_by, created_at | One row per viewing; rewatches allowed |
| `screening_viewers` | screening_id, user_id | Both users = watched together; one = solo |
| `ratings` | screening_id, user_id, stars (1–5), comment, updated_at | Unique (screening_id, user_id) |
| `watchlist_items` | id, movie_id, added_by, added_at | Removed when marked watched |
| `likes` | user_id, movie_id, liked_at | S13; unique (user_id, movie_id) |
| `movie_nights` | id, movie_id, proposed_by, date, status | S8 |
| `top_five` | user_id, position (1–5), movie_id | Movie must have a screening |
| `recommendations` | id, movie_id, for_user (nullable = both), reason, score, generated_at | Cached AI output |
| `import_rows` | id, raw_title, watched_year, matched_movie_id, status | R15 review step |
| `couple_stats` | best_streak, updated_at | Single row; streak itself is computed |
| `home_notes` | mood, status_note, updated_by, updated_at | Optional; no longer shown in the UI |
| `sessions` | sid, user_id, expires_at | Server-side sessions |

Stats (R6) and the streak (R16) are computed with SQL over `screenings`, `screening_viewers`, `ratings` and `movie_genres`.

---

## 8. Decisions log

| Question | Decision |
| --- | --- |
| Movies or series? | Both |
| Shared or separate Watched list? | Both; shared ("Ours") is the default and main view |
| Year filter on Watched | Watched year |
| "Top rated" in Stats | Shared average by default, per-user view available |
| Profile watchlist | Titles this user added (clickable) |
| Watchlist after "Watched" | Card is removed |
| Country (streaming info) | Dropped with S4 (Nov 25) |
| Past watch history | Imported once from title + watched year (R15); not on the calendar |
| Suggested features | S1–S13 approved, except S4 and S5 (removed Nov 25) and S10 (badges) |
| What the partner can see | Only the Profile page (Nov 25) |
| Design direction | Retro Minihome (binder, pixel fonts, grid paper); light by default |
| Profile picture | Pixel avatar maker instead of photo upload |
| Badges | Removed; a shared weekly streak instead (R16) |
| Main action | "+ Log a watch", prominent on every page |
| Side widget, mobile bottom bar | Removed as redundant |
| Frontend data | Services layer with mock services until the backend is ready |
| Page name "Watched" | Open: keep "Watched" or rename to "Diary" |

**Still waiting on:**
- [ ] Names and usernames of the two users.
- [ ] The past-watches list (CSV or spreadsheet: title, watched year).
- [ ] "Watched" or "Diary" for the page name.
