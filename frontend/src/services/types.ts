// Types for every request and response in docs/API.md. Keep in sync with schemas.ts.

export type MediaType = 'movie' | 'tv';
export type Scope = 'ours' | 'mine' | string; // string = a username
export type TypeFilter = MediaType | 'all';

export interface Avatar {
  style: 'short' | 'long' | 'bun' | 'bob';
  hair: 0 | 1 | 2 | 3;
  skin: 0 | 1 | 2 | 3;
  top: 0 | 1 | 2 | 3;
  extra: 'none' | 'glasses' | 'cap';
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: Avatar;
  favoriteGenreIds: string[];
  theme: 'light' | 'dark';
}

export interface Genre {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  name: string;
  character?: string;
}

export interface Title {
  id: string;
  tmdbId: number | null;
  mediaType: MediaType;
  source: 'tmdb' | 'manual';
  title: string;
  year: number | null;
  overview: string | null;
  posterUrl: string | null;
  runtimeMinutes: number | null;
  seasons: number | null;
  genres: Genre[];
  cast: Person[];
}

export type Stars = 1 | 2 | 3 | 4 | 5;

export interface Rating {
  userId: string;
  stars: Stars;
  comment: string | null;
  updatedAt: string;
}

export interface Screening {
  id: string;
  number: number;
  title: Title;
  watchedOn: string | null;
  watchedYear: number;
  datePrecision: 'day' | 'year';
  season: number | null;
  viewerIds: string[];
  source: 'app' | 'import';
  addedBy: string;
  createdAt: string;
  ratings: Rating[];
  averageStars: number | null;
  commentCount: number;
  hiddenPartnerRating: boolean;
}

export type Reaction = 'want' | 'maybe' | 'nah';

export interface WatchlistItem {
  id: string;
  title: Title;
  addedBy: string;
  addedAt: string;
  reactions: { userId: string; reaction: Reaction }[];
}

export interface Recommendation {
  title: Title;
  matchPercent: number;
  reason: string;
  forUserId: string | null;
}

export interface Streak {
  current: number;
  best: number;
  lastWeeks: boolean[]; // oldest → newest, length 8
}

export interface GenreCount {
  genre: Genre;
  count: number;
}

export interface Stats {
  total: number;
  movies: number;
  series: number;
  together: number;
  solo: number;
  topGenre: GenreCount | null;
  genres: GenreCount[];
  topRated: { screening: Screening; stars: number }[];
  tasteMatchPercent: number | null;
  byMonth: number[];
  undatedCount: number;
  bestStreak: number;
}

export interface Profile {
  user: User;
  watchedCount: number;
  tasteMatchPercent: number | null;
  topFive: (Screening | null)[];
  watchlistAdded: WatchlistItem[];
  recentlyRated: Screening[];
}

export interface HomeSummary {
  todayCount: number;
  totalCount: number;
  mood: string;
  statusNote: string;
  streak: Streak;
  recentlyWatched: Screening[];
  upNext: WatchlistItem[];
}

export type ImportStatus = 'matched' | 'needs_review' | 'manual' | 'skipped' | 'imported';

export interface ImportRow {
  id: string;
  rawTitle: string;
  watchedYear: number;
  match: Title | null;
  candidates: Title[];
  status: ImportStatus;
}

export interface MovieNight {
  id: string;
  title: Title;
  proposedBy: string;
  date: string;
  status: 'proposed' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Provider {
  name: string;
  url?: string;
}

export interface HistoryEntry {
  id: string;
  watchedOn: string | null;
  watchedYear: number;
}

export interface CalendarDay {
  date: string;
  screenings: Screening[];
}

// ---- Request bodies and query params ----

export interface LoginBody {
  username: string;
  password: string;
  remember: boolean;
}

export interface ScreeningFilters {
  scope: Scope;
  year?: number;
  genreId?: string;
  minStars?: number;
  type?: TypeFilter;
  page?: number;
  pageSize?: number;
}

export interface CreateScreeningBody {
  titleId: string;
  watchedOn?: string;
  viewerIds?: string[];
  season?: number;
}

export interface UpdateScreeningBody {
  watchedOn?: string;
  viewerIds?: string[];
  season?: number;
}

export interface RateBody {
  stars: Stars;
  comment?: string;
}

export interface ManualTitleInput {
  title: string;
  genreIds: string[];
  mediaType: MediaType;
  year?: number;
  overview?: string;
  poster?: File;
  posterUrl?: string;
}

export type BrowseCategory = 'trending' | 'top_rated' | 'genre';
export type RecommendationFor = 'both' | 'me';

export interface StatsQuery {
  scope: Scope;
  year?: number;
  month?: number;
}

export interface WatchlistQuery {
  type?: TypeFilter;
  addedBy?: string;
  sort?: 'both_want' | 'newest';
}

export interface RandomQuery {
  type?: TypeFilter;
  genreId?: string;
  maxRuntime?: number;
}

export interface MarkWatchedBody {
  watchedOn?: string;
  viewerIds?: string[];
}

export interface ImportRowPatch {
  matchTitleId?: string;
  status?: 'skipped' | 'manual';
}
