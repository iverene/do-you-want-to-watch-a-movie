# DESIGN.md — "Do You Want to Watch a Movie?"

**Design concept: Retro Minihome**
Version 1.0 · Nov 24, 2026

A private movie diary for exactly two people. The look borrows from 2000s personal homepages and blogs: a ring-binder notebook on grid paper, side tabs, pixel fonts, tiny counters, speech-bubble comments and framed posters. It should feel nostalgic, cozy and a little playful, but stay clean and easy to use.

This document is the source of truth for the frontend. The requirements live in the requirements doc (R1–R16, S1–S12). The visual reference is the "Retro Minihome" page of the design canvas.

---

## 1. Design principles

1. **Shared first, personal second.** Every page opens on the shared view ("Ours"). A personal view ("Mine" / the other person's name) is always one click away, but never the default.
2. **One binder, everywhere.** Every signed-in page is the same binder: left page = the couple's profile spread, right page = the content, tabs on the right edge. Only the right page changes between pages.
3. **Logging a watch is the main action.** The orange **+ Log a watch** button is the most prominent control on every page, desktop and mobile.
4. **Retro look, modern behavior.** Pixel fonts and bevels are decoration. Interaction stays modern: real buttons, keyboard access, fast search, no page reloads.
5. **No clutter.** No side widgets, no bottom bar on mobile, no badges. Each piece of information lives on the one page where it belongs.
6. **Mock-friendly placeholders.** Where real data is missing, show a tinted poster placeholder and bracketed text, never fake stats.

---

## 2. Foundations

### 2.1 Color tokens

Define every color as a CSS custom property on a theme class (`.theme-light` on `<html>` by default, `.theme-dark` when the user picks Dark in Settings). Components only ever use tokens.

| Token | Light (default) | Dark | Used for |
| --- | --- | --- | --- |
| `--page` | `#DCE7FB` | `#0F1628` | App background (grid paper base) |
| `--grid` | `#B9CCF0` | `#1E2A47` | Grid-paper lines |
| `--frame` | `#4FAAD3` | `#2B5F86` | Binder cover |
| `--paper` | `#FFFFFF` | `#1A2133` | Binder pages, cards, inputs |
| `--panel` | `#F3F4F6` | `#222A3D` | Inset panels (top pick box, notes) |
| `--inner` | `#ECEEF2` | `#151B2B` | Inside of the binder, empty bar track |
| `--line` | `#C9CDD4` | `#34405A` | Borders, dividers |
| `--dot` | `#B5BAC2` | `#46526E` | Dashed/dotted dividers |
| `--ink` | `#2E2E33` | `#E8ECF5` | Main text |
| `--muted` | `#6B6E75` | `#A4ACBE` | Secondary text |
| `--link` | `#2C68B0` | `#86B6FF` | Links, section titles |
| `--tab` | `#1F78A6` | `#3A8FC4` | Inactive tabs, selected segments, selected chips |
| `--ontab` | `#FFFFFF` | `#0F1628` | Text on `--tab` |
| `--red` | `#D23B2F` | `#FF6B5E` | Counter numbers, Sunday in calendars |
| `--orange` | `#E8792F` | `#FF9A55` | Primary action, NEW! tag, accents |
| `--yellow` | `#FFF0A3` | `#4D4522` | Note labels (TOP PICK, No.128), streak card |
| `--sky` | `#CFE4FF` | `#22324F` | Avatar backgrounds |
| `--star` | `#F2A21B` | `#FFC24B` | Filled stars |
| `--bubble` | `#F1F2F4` | `#242C40` | Speech-bubble fill |

Fixed (theme-independent) colors:
- Bevel button gradient `#FFFFFF → #E4E7EC`, border `#9AA0AA`, text `#2E2E33`.
- Pixel button border and text `#3A2A20` / `#22140A` (always on `--orange` or `--yellow`).
- Poster frame: border `#9AA0AA`, gradient mat `#FFFFFF → #F7B07A`.
- Poster placeholder tints (cycled): `#D9E6FA`, `#FBE1D3`, `#E2F1D8`, `#EFE3FA`, `#FFF0B8`, `#DDEFF3`.
- Success: `#E7F6DF` background, `#86C440` border, `#3E7A1A` text.

**Contrast rules.** Body text is `--ink` on `--paper` (13:1 light). Small text on `--tab` uses `--ontab` (white on `#1F78A6` = 4.9:1). Text on `--orange` is dark `#22140A`, never white. Never put `--muted` text smaller than 12 px.

### 2.2 Background

The app background is grid paper:
```css
background-color: var(--page);
background-image:
  linear-gradient(var(--grid) 1px, transparent 1px),
  linear-gradient(90deg, var(--grid) 1px, transparent 1px);
background-size: 28px 28px;
```

### 2.3 Typography

All four fonts are on Google Fonts.

| Role | Font | Weights | Where |
| --- | --- | --- | --- |
| Pixel display | **DotGothic16** | 400 | Page/site title, big numbers (4.5, [N]), titles in dialogs and detail, comments, month names |
| Tiny caps | **Silkscreen** | 400, 700 | Counters (`TODAY 12 \| TOTAL 2,481`), tags (NEW!, EDIT, TOP PICK), small section labels, calendar weekday names |
| Body / UI | **Nanum Gothic** | 400, 700, 800 | Everything else: body, lists, buttons, form labels |
| Handwritten | **Gaegu** | 400, 700 | Status note, AI "because…" reasons, "added by [name]" |

```html
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen:wght@400;700&family=Nanum+Gothic:wght@400;700;800&family=Gaegu:wght@400;700&display=swap" rel="stylesheet">
```

Type scale (desktop / mobile):

| Style | Font | Size | Notes |
| --- | --- | --- | --- |
| Site title | DotGothic16 | 22 / 19 px | "[Name A] & [Name B]'s movie room ☆" |
| Page title in content | DotGothic16 | 30–34 / 22 px | Title detail, profile name |
| Big number | DotGothic16 | 34–40 / 26–28 px | Ratings, stats |
| Section title | Nanum Gothic 800 | 16 / 14 px, `--link` | "Recommended", "Recently watched" |
| Section sub-label | Silkscreen | 9 px, `--muted`, uppercase | "AI PICKS FROM YOUR RATINGS" |
| Body | Nanum Gothic 400 | 14–15 / 13–14 px | |
| Small/meta | Nanum Gothic 400 | 12–13 / 11–12 px, `--muted` | "[Year] · Movie · [Genre]" |
| Counter / tag | Silkscreen | 9–11 px | Always uppercase |
| Handwritten | Gaegu | 17–20 / 14–17 px | |
| Comment | DotGothic16 | 16 / 14 px, line-height 1.6 | Inside speech bubbles |

Minimum readable size: 11 px for Silkscreen tags, 12 px for everything else.

### 2.4 Spacing, radius, borders, shadows

- Spacing scale: 4, 6, 8, 10, 12, 14, 16, 18, 22, 26 px. Default gap between blocks on a page: 12 px. Inside cards: 10–14 px.
- Radius: binder cover 26 px (mobile 18), inner stitch 18 (12), pages 14 (10), cards 8, chips 999, tags 2, pixel buttons 0–6. **Posters have square corners.**
- Borders: 1 px `--line` for cards and pages; 1 px `#8E949E` for form controls; 2 px `#9AA0AA` for poster frames and pixel windows; 2 px dashed white (80% opacity) for the binder stitch; 1 px dashed `--dot` for list dividers.
- Shadows: pixel buttons use inset bevels `inset -3px -3px 0 rgba(0,0,0,.18), inset 3px 3px 0 rgba(255,255,255,.35)`, plus `3px 3px 0 rgba(58,42,32,.35)` on the main CTA. Pixel windows: `10px 10px 0 rgba(0,0,0,.18)`. Nothing else has a soft blur shadow.

### 2.5 Iconography

- Use text glyphs and tiny pixel SVGs, not an icon font: ▶ (links), ◀ ▶ (month nav), ▼ (dropdowns), ★ (stars), ♡ (favorite), ✎ (plan/edit), ✓ (watched), ? (random), x (close), ☼ / ☾ (light/dark).
- The comment icon is a 12 px outline speech-bubble SVG.
- Pixel art (avatars, flame, mini theater) is SVG with `shape-rendering="crispEdges"`, built from a grid of `<rect>`s.
- Never use emoji.

### 2.6 Motion

Keep it small and snappy (120–180 ms, `ease-out`):
- Tab or page change: right page cross-fades (opacity 0→1, 150 ms). The binder never moves.
- Pixel buttons: on press, move 1 px down-right and drop the outer shadow.
- Dialogs: fade the dim overlay in, and pop the window in from scale .97.
- Stars when rating: the picked star bumps (scale 1.15 → 1).
- Respect `prefers-reduced-motion`: no transforms, fades only.

---

## 3. Layout system

### 3.1 Desktop (≥ 1024 px)

```
┌ grid-paper background ─────────────────────────────────────────────┐
│  ┌ binder cover (--frame, radius 26, padding 16) ─────────────┐    │
│  │ ┌ stitch (2px dashed, --inner) ───────────────────────────┐ │ ┌tab┐
│  │ │ TODAY 12 | TOTAL 2,481   [Name A] & [Name B]'s movie… ☆  [+ Log a watch] │Home│
│  │ │ ┌ left page 270px ┐ ○○ ┌ right page (flex 1) ─────────┐ │ │Wat…│
│  │ │ │ duo avatars     │    │ page content                 │ │ │Wat…│
│  │ │ │ streak card     │ ○○ │ (scrolls inside if long)     │ │ │Pro…│
│  │ │ │ TODAY IS..      │    │                              │ │ │Set…│
│  │ │ │ status note     │    │                              │ │ └───┘
│  │ │ │ names, url      │    │                              │ │    │
│  │ │ │ ★ Ours ▼        │    │                              │ │    │
│  │ │ └─────────────────┘    └──────────────────────────────┘ │    │
│  │ └──────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

- Binder: width `min(1060px, 100vw - 140px)`, height `calc(100vh - 100px)`, min 760 px, centered with room on the right for the tabs.
- Header strip inside the binder: counter (left, aligned with the left page), site title (flex), **+ Log a watch** (right).
- Left page: 270 px fixed, full height, padding 16–18.
- Rings: two pairs of ring pills (40 × 12 px, gradient `#FFF → #B9BEC8`) straddling the gap between the pages, near the top and near the bottom.
- Right page: flex 1, padding 18 × 22, `overflow-y: auto`. The binder itself never scrolls.
- Tabs: vertical stack attached to the right edge of the binder, starting 104 px from the top.

### 3.2 Mobile (< 1024 px; designed at 390 × 844)

```
TODAY 12 | TOTAL 2,481            [+ Log a watch]
[Name A] & [Name B]'s movie room ☆
┌ binder (radius 18, padding 8) ───────────────┐
│ ┌ stitch ──────────────────────────────────┐ │
│ │ [Home][Watched][Watchlist][Profile]      │ │  ← tabs along the top
│ │ ┌ page ────────────────────────────────┐ │ │
│ │ │ content (scrolls)                    │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

- **No bottom navigation bar.** Navigation is the tab row. Settings is reached from Profile (gear link) and from the "Settings" tab item in an overflow if needed.
- The left-page profile spread is not shown on mobile. Its important parts move: the **streak card** and duo avatars appear at the top of Home, and the Ours/Mine switch sits in each page's toolbar.
- Page padding 12 px; the page content scrolls, the header stays.
- Dialogs become bottom sheets (760 px tall, radius 18 top corners) on mobile.

### 3.3 Breakpoints

| Range | Layout |
| --- | --- |
| < 640 px | Mobile binder; 2–3 column poster grids |
| 640–1023 px | Mobile binder, wider; 4-column poster grids |
| ≥ 1024 px | Desktop binder with left page and right tabs |
| ≥ 1440 px | Same, centered; no stretching beyond 1060 px binder |

---

## 4. Components

Each component lists its anatomy, states and behavior. Names match the suggested React component names.

### 4.1 `LogWatchButton` (primary CTA)
- Orange (`--orange`) block, 2 px `#3A2A20` border, radius 6, pixel bevel + offset shadow.
- Content: Silkscreen "+" (22 px) + DotGothic16 "Log a watch" (18 px desktop / 15 px mobile). Height 46 / 40 px.
- Hover: background lightens 6%. Active: 1 px press. Focus: 3 px `--tab` outline, 2 px offset.
- Opens the Log-a-watch dialog (section 6.10). Keyboard shortcut: `N`.
- The same style with other labels is used for the final step of flows ("▶ Save & rate", "★ Save rating", "▶ Come in").

### 4.2 `BevelButton` (secondary)
- Gradient `#FFFFFF → #E4E7EC`, 1 px `#9AA0AA` border, radius 4, bold 13–14 px, min height 44 px (36 px allowed in dense toolbars on desktop only).
- Used for: Add to watchlist, Mark as watched, Stats, Change password, Rate it, Save avatar.

### 4.3 `PixelIconButton`
- 44 × 44, `--orange` (or `--yellow`) fill, 2 px dark border, pixel bevel, Silkscreen glyph.
- Used for: close (x), favorite (♡), add to Top 5 (★), random pick (?). Always has `aria-label`.

### 4.4 `ArrowLink`
- `▶` in `--orange` (10 px) + text in `--ink`. Underline on hover. Used for: "Spin instead", "See all", "Back to Watched", "Add it manually".

### 4.5 `Tag`
- Silkscreen 9 px, uppercase, 0 × 4 px padding, radius 2.
- Variants: `NEW!` (orange bg, white text — allowed because it's bold display text ≥ 9 px Silkscreen; if you need strict AA, use dark text), `EDIT` (`#8E949E` bg), `TOP PICK` and `No.128` labels (`--yellow` bg, `#C8B85A` border, dark text), `PRIVATE` / `NO DATE` (`--panel` bg, `--line` border).

### 4.6 `Counter`
- Silkscreen 11 px: `TODAY <red>12</red> | TOTAL 2,481`.
- TODAY = titles logged today by either user. TOTAL = total watched (all time, both users).

### 4.7 `SectionHeader`
- Title (Nanum Gothic 800, 16 px, `--link`) + optional Silkscreen sub-label + optional right slot (switches, links). 1 px `--line` bottom border, 5 px padding below.

### 4.8 `Segmented` (switch)
- Inline group with a 1 px `#8E949E` border and radius 4. Selected segment: `--tab` fill, `--ontab` text, bold. Others: bevel gradient. Height 32 px (44 px touch area on mobile via padding).
- Uses `role="radiogroup"` with `role="radio"` items, and arrow-key navigation.
- Instances: Ours / Mine / [Name B]; For both / For me; All / Movies / Series; List / Calendar; Light / Dark; Both of us / Just me.

### 4.9 `Dropdown`
- 32 px (desktop) or 44 px (forms, mobile) tall, 1 px `#8E949E` border, label + a 22–26 px bevel cap with ▼.
- Native `<select>` underneath for accessibility; styled wrapper on top.
- Instances: "★ Ours" (left page), Watched in [year], Genre, Stars, Movies & series, Year, Month, Added by, Sort, Season.

### 4.10 `Chip`
- Pill, 5 × 12 px padding, 13 px bold. Default: `--paper` + `--line` border. Selected: `--tab` fill, `--ontab` text.
- Used for genres (filter and multi-select), reasons ("[N]% match"), and favorite genres.

### 4.11 `Poster` and `FramedPoster`
- `Poster`: image, square corners, 1 px `--line` border. Aspect 2 : 3. If no image, show a tinted placeholder (cycled tints) with Silkscreen "POSTER".
- `FramedPoster`: the hero version — 3 px `#9AA0AA` border, 5–10 px gradient mat (`#FFF → #F7B07A`), then the poster. Used for the top pick, title detail, rate step and Top 5.
- Card under a poster: title (bold 14, ellipsis), meta line (12, `--muted`), optional extra (match %, stars, comment count).

### 4.12 `StarRating`
- **Display:** 5 ★ glyphs; filled in `--star`, empty in `--line`. Sizes 9–22 px. Always has `aria-label="4 of 5 stars"`. Half stars are not used; averages show as a number (4.5) next to rounded stars.
- **Input** (rate step): 5 square pixel buttons, 48 px (40 on mobile). Filled ones are `--yellow` with a dark border. `role="radiogroup"`; arrow keys change the value; label below in Gaegu ("4 stars · really liked it").

### 4.13 `SpeechBubble` (comments)
- 2 px `--ink` border, radius 18, `--bubble` fill, 16 × 22 px padding, tail at bottom right.
- Content: name in DotGothic16 `--link` ("[Name A] :"), their stars, comment text in DotGothic16 16 px.
- **Blind rating (S2):** until the current user has rated, the partner's bubble shows `B: ?????` in a dashed box with "[Name B]'s stars stay hidden until you rate."

### 4.14 `PixelWindow` (dialog)
- Window: `#E6E8EC` body, 2 px `#9AA0AA` border, hard shadow. A yellow title tab hangs at the top-left (DotGothic16 20 px). Pixel close button (x) at the top-right.
- Inner page: `--paper`, radius 18, padding 22.
- Desktop: centered, 760–900 px wide, over a dim overlay `rgba(20,30,50,.45)`. Mobile: bottom sheet.
- `role="dialog"`, `aria-modal`, focus trap, Esc closes, focus returns to the button that opened it.

### 4.15 `StreakCard` (R16)
- `--yellow` card, 2 px `#3A2A20` border, small offset shadow.
- Pixel flame (8 × 10 grid, scale 3–4) + DotGothic16 "[N]-week streak" + 11 px "watched together every week" + 8 week blocks (14 px; filled `--orange` = a week with a shared watch, empty = `--paper`).
- Streak 0: grey flame, "Start a streak: watch something together this week."

### 4.16 `PixelAvatar` and `AvatarMaker` (R13)
- Avatar = a 10 × 14 pixel grid rendered as SVG at any integer scale. Settings:

| Field | Options |
| --- | --- |
| `style` | `short`, `long`, `bun`, `bob` |
| `hair` | `#3B2A26`, `#7A3B2E`, `#D9A441`, `#8E6FD6` |
| `skin` | `#FFE1CC`, `#F5C9A6`, `#D9A07A`, `#9C6B4A` |
| `top` | `#4F8FD6`, `#F28FB4`, `#86C440`, `#E9893F` |
| `extra` | `none`, `glasses`, `cap` |

- Fixed parts: eyes `#2A2A2A`, blush `#FFA6A0`, mouth `#E07B7B`, pants `#2F3E66`, shoes `#3A3A3A`, cap `#E9893F`.
- `AvatarMaker`: large preview (scale 9, on `--sky` with a frame) + option rows (HAIR thumbnails, COLOR, SKIN, TOP swatches, EXTRA buttons), each option a 44 × 44 button with `aria-pressed`. Selected = 3 px `--tab` border. "Shuffle" link randomizes; "Save avatar" saves.
- `DuoAvatars`: both users' avatars side by side on `--sky` with four white pixel sparkles. Used on the left page, login and mobile Home.

### 4.17 `CalendarGrid` (R7)
- 7 columns (SUN–SAT, Silkscreen; Sunday red, Saturday blue).
- Day with a watch: the poster of the latest title fills the cell; the day number sits bottom-left on a white chip; 2 px `#9AA0AA` border. More than one title: a stacked-card offset + an orange count badge top-right.
- Empty day: 1 px dashed `--dot` border, number in `--muted`. Today: 2 px `--tab` border.
- Cell height 84 (desktop) / 58 (mobile). Tap/click opens that day (one title → title detail; several → a small list popover).

### 4.18 Charts (Stats)
- `PixelBarChart` (genres): label (90 px) + a row of 12 px square blocks (`--tab` filled, `--inner` empty, max 18) + count.
- `MonthChart`: 12 bars on a 2 px `--ink` baseline, bars `--sky` with a dark border; the selected/current month in `--orange`. Silkscreen month initials.
- `BigNumber`: Silkscreen label, DotGothic16 34 px value, 12 px caption, 1 px `--line` box.

### 4.19 `PixelMiniTheater` (decorative, optional)
- SVG scene: wall, checker floor, sparkles, a screen with ▶, a bench, both avatars and a speech bubble. Purely decorative (`aria-hidden` or a short `aria-label`). It may appear on Home if there is room, never instead of content.

### 4.20 Form fields
- Label (13 px, 800) above a 40–44 px input, 1 px `#8E949E` border, `--paper` bg, 0 × 10 px padding. Optional note in `--muted` 12 px next to the label ("required", "optional").
- Error: border `--red`, message below in `--red` 12 px. Focus: 2 px `--tab` outline.
- Textarea for comments uses DotGothic16 15 px.

---

## 5. The left page (profile spread)

Shown on every signed-in desktop page, identical everywhere:

1. `DuoAvatars` in a 1 px framed box.
2. `StreakCard`.
3. "TODAY IS.." mood line: Silkscreen label + DotGothic16 mood ("★ movie mood"). Editable (click → small input), shared by both users.
4. Status note in Gaegu (2–3 lines, max 80 chars), editable via "▶EDIT". "▶HISTORY" shows past notes.
5. Dotted divider.
6. "[Name A] & [Name B]" (Nanum 800, 18, `--link`) and the room URL in orange (`movie-room/[username]`).
7. "★ Ours" dropdown: switches the whole app's default scope (Ours / Mine / [Name B]). Pages can still override with their own switch.

---

## 6. Pages

All routes except `/login` require a session. Tabs: Home, Watched, Watchlist, Profile, Settings. Watched contains three views (list, calendar, stats) plus title detail.

### 6.1 Login — `/login` (R1)
- Closed binder centered on grid paper. Left page: `DuoAvatars`, Gaegu "two seats saved. sign in to sit down.", counter. Right page: Silkscreen "MOVIE ROOM FOR TWO", DotGothic16 title "Do You Want to Watch a Movie?", dotted divider, Username, Password, "Keep me signed in" checkbox, **▶ Come in** (CTA style), `PRIVATE` tag + "Only two people have a key to this room."
- No sign-up link. Errors: "That username and password don't match." After 5 failed tries: "Too many tries. Wait 15 minutes."

### 6.2 Home — `/` (R2, R4)
Right page, top to bottom:
1. `SectionHeader` "Recommended" · "AI PICKS FROM YOUR RATINGS" · switches *For both / For me* and *All / Movies / Series*.
2. **Top pick** panel (`--panel`): `FramedPoster` (120 × 172), `TOP PICK` tag + type, DotGothic16 title, meta (year · genre · runtime · "streaming on [Provider]"), Gaegu reason ("because you both gave [Title] five stars"), chips (match %, genre, "[Actor] in the cast"), actions: *+ Add to watchlist*, *Mark as watched*, ▶ *Spin instead*.
3. "More picks for you" row: 7 posters (92 × 132) with title, year · type, and "[N]% match" in orange. ▶ Refresh.
4. "Browse by genre" · "TRENDING · TOP RATED": genre chips (All selected), which filter a browse row.
5. Two columns: "Recently watched" (3 items, newest with NEW!, stars) and "Watchlist · UP NEXT" (2 items with "added by").
- Already-watched titles never appear in recommendations.
- Mobile Home order: streak card + duo avatars, Recommended (Both/Me), top pick, 4 picks, genre chips, Recently watched.

### 6.3 Watched — list — `/watched` (R5)
1. Header "Watched" · "NEWEST FIRST" · *List / Calendar* · **Stats** button.
2. Toolbar: *Ours / Mine / [Name B]*, then dropdowns: Watched in [year] (watched year), Genre, Stars (any / 4+ / 3+ …), Movies & series.
3. Month groups (DotGothic16 "November 2026" + "[N] titles"), each a row of cards: poster (104 × 150), title, "Nov 22 · Movie" + comment count, and both users' stars (A ★★★★★ / B ★★★★☆), or "solo" if one person watched.
4. Imported year-only titles: a dashed `--panel` row per year: "imported · watched in 2025 · no exact date", sorted after the dated titles of that year, with a *Rate it* button if unrated.
- Empty state: Gaegu "nothing here yet.. log your first watch!" + LogWatchButton.

### 6.4 Watched — calendar — `/watched/calendar` (R7)
Header with *List / Calendar* (Calendar selected) and Stats; toolbar with *Ours / Mine / [Name B]* and month navigation (◀ 2026 . 11 ▶); `CalendarGrid`; a note row: `NO DATE` tag + "[N] imported titles from 2026 aren't on the calendar. ▶ See them in the list".

### 6.5 Watched — stats — `/watched/stats` (R6)
Header "Stats" · ▶ Back to Watched. Toolbar: *Ours / Mine / [Name B]*, Year dropdown, Month dropdown (All + 12 months).
Content: 4 `BigNumber`s (Total watched with movies/series split, Top genre, Taste match %, Together with solo count), then two columns: Genres (`PixelBarChart`, top 5) and Top rated (4 items, rank in orange, poster, stars). Then "By month" `MonthChart` for the year, then the note "[N] imported titles have no month, so they count in the year only." Best streak appears under Together.
- "Top rated" uses the average of both users in Ours, and that user's own stars in a personal view.

### 6.6 Title detail — `/watched/:screeningId` (R10)
- Top row: ▶ Back to Watched, `No.128 (2026.11.22)` yellow label (No. = the running number of the screening), ♡ and ★ (add to Top 5) pixel buttons.
- Body: `FramedPoster` (200 × 290) + Silkscreen "MOVIE · WATCHED TOGETHER", DotGothic16 title, meta, big average "4.5" + stars + "average of you two", description, cast, "Stream in PH: [Provider]", watch history ("Watched Nov 22, 2026 · also Mar 3, 2025 (rewatch)"), actions: *Log a rewatch*, *Edit my rating*, *Change date*.
- Then "Ratings & comments (2) NEW!" with ▶ Write a comment, and one `SpeechBubble` per user. Blind rating applies.

### 6.7 Watchlist — `/watchlist` (R11, R12, S1, S5, S8)
- Header "Watchlist" · "[N] TITLES TO WATCH" · *All / Movies / Series*.
- Toolbar: *+ Add to watchlist* (opens the same search dialog in watchlist mode), Spin (? pixel button → random pick from the current filter), "Added by" dropdown, "Sort: both want it first" dropdown.
- Grid (5 columns desktop, list on mobile): poster, title, year · type, mini avatar + Gaegu "added by [Name]", reactions (want / maybe / nah; the other user picks), **✓ Watched** (orange) and ✎ plan-a-night button.
- ✓ Watched: creates a screening for today, removes the card, then opens the rate step.

### 6.8 Profile — `/profile/:username` (R13, R14)
- Switch *[Name A] / [Name B]* at the top (view either profile).
- Head: large `PixelAvatar` on `--sky`, DotGothic16 name, "@username · [N] watched · taste match with [Name B] [N]%", FAVE GENRES chips. Own profile: *Customize avatar* (→ Settings) and ▶ View [Name B]'s profile.
- Top 5: five `FramedPoster`s with yellow rank squares 1–5; ▶ Edit (own profile) opens a picker that lists only watched titles.
- Two columns: Watchlist (*Added by me / Shared*) as small posters; "Recently rated" (3 items with a short quote and stars).
- **No badges.**

### 6.9 Settings — `/settings` (R13, S12)
Two columns on desktop, one on mobile:
- **Your avatar** · "PIXEL AVATAR MAKER": `AvatarMaker` + Display name.
- **App:** Install on this phone (On/Off), Movie-night reminders (On/Off), ▶ Sign out.
- **Appearance:** *☼ Light / ☾ Dark* (Light default). Applies instantly; saved per user.
- **Favorite genres:** chip multi-select (used by recommendations and shown on Profile).
- **Change password:** current, new (min 10 chars), confirm; *Change password*. Success signs out the user's other sessions.
- **Import past watches (R15):** "Upload a CSV with title and year watched", *Choose CSV file* → `/settings/import` review screen.

### 6.10 Log a watch (R8, R9, R10)
A `PixelWindow` titled "Log a watch", opened by the CTA from any page. Step indicator: `1 FIND IT ▸ 2 RATE IT`.

**Step 1a — Search** (900 × 660 desktop):
- Left: search field (focused, 2 px `--tab` border, debounced 300 ms), *All / Movies / Series*, results (poster, "[Title] ([Year])", type, genre, "with [Actor], [Actor]", *Select*); the selected row is highlighted with "✓ SELECTED". Below: "Can't find it in the list? ▶ Add it manually".
- Right panel: selected title, **Watched on** "Today · Nov 24, 2026" (filled in automatically, "change" opens a date picker), **Who watched** *Both of us / Just me*, **Season** (series only), then **▶ Save & rate**.
- States: typing (skeleton rows), no results ("No matches. Try the original title, or add it manually."), API down ("Search is taking a break. Add it manually?").

**Step 1b — Add manually** (R9): poster upload box (upload or paste an image link), Title (required), Genre chips (required, 1+), Year (optional), Type *Movie / Series*, Short description (optional), the same right panel, ▶ Save & rate. "▶ Back to search".

**Step 2 — Rate it**: success strip "✓ SAVED [Title] is in Watched · Nov 24, 2026", framed poster + title, "Your rating, [Name A]" `StarRating` input, comment textarea (optional), blind-rating note, **★ Save rating** and ▶ Skip for now. Skipping leaves a "Rate it" badge on the title.

### 6.11 Import review — `/settings/import` (R15)
Table-like list: raw title + year from the CSV → matched poster/title/year (or "No match"), with *Change match* and *Add manually* per row; a summary ("[N] matched · [N] need a look"); **Import [N] titles**. Re-running skips titles already imported.

---

## 7. States and feedback

| Situation | Treatment |
| --- | --- |
| Loading | Pixel skeletons: grey `--inner` blocks in the poster and text shapes, a slow 1.2 s opacity pulse |
| Empty | Gaegu sentence + one action ("log your first watch!", "watchlist's empty — add something you both want") |
| Error | `--red` text in a dashed box + *Try again*; never a blank page |
| Success | Green success strip or a toast (bottom-center on mobile, top-right inside the binder on desktop), 3 s |
| Unsaved form | Leaving asks "Discard changes?" |
| Offline | A thin yellow bar under the header: "You're offline. Changes will sync when you're back." |

---

## 8. Accessibility

- Every interactive element is a real `<button>`, `<a>` or form control; targets are at least 44 × 44 on touch.
- Visible focus: 2–3 px `--tab` outline with a 2 px offset on everything.
- Tabs use `role="tablist"` semantics only if they switch in place; since they change routes, use a `<nav aria-label="Main">` with `aria-current="page"`.
- Stars, avatars and charts have text alternatives. Decorative pixel art is `aria-hidden`.
- Color is never the only signal: the selected state also changes weight or border, and the streak blocks are labeled ("6 of the last 8 weeks").
- Dialogs trap focus and close on Esc.
- Pixel fonts are only for short text. Long text (descriptions, settings help) uses Nanum Gothic.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` (only as the initial theme before the user sets one).

---

## 9. Content and copy

- Voice: short, warm, lowercase is fine in handwritten (Gaegu) notes; sentence case everywhere else.
- No greetings ("Good evening") and no "tonight" copy.
- Names: always use the users' display names; "[Name A]/[Name B]" are placeholders only.
- Dates: "Nov 22, 2026" in text; "2026.11.22" in the No. label; "2026 . 11" in calendar navigation.
- Numbers: thousands separator ("2,481"); percentages without decimals.
- Placeholders in mocks: bracketed (`[Title]`, `[Provider]`) only in the design files; the app's mock data uses realistic sample values.

---

## 10. Implementation notes

- Implement tokens as CSS variables and map them into Tailwind (`theme.extend.colors.page = 'var(--page)'`, etc.) so Tailwind classes stay theme-aware.
- Fonts: preload DotGothic16 and Nanum Gothic; `font-display: swap`.
- Pixel SVGs: render from data (`string[]` rows + palette) so avatars and the flame are components, not image files.
- Posters: lazy-load images; use the tinted placeholder while loading and on error.
- Theme switching: set the class on `<html>`; store the choice per user (server) and in `localStorage` for first paint.
- Desktop binder height is tied to the viewport; only the right page scrolls. Test at 1280 × 800 and 1440 × 900.
- Mobile: test at 360, 390 and 430 px wide.
