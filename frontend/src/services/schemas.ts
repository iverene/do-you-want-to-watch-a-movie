// Zod schemas mirroring types.ts. HTTP responses are parsed with these in development.
// Each schema is annotated with its TS type, so the compiler flags any drift between the two files.
import { z } from 'zod';
import type * as T from './types';

const id = z.string().min(1);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timestamp = z.string().min(1);
const nullableNum = z.number().nullable();

export const mediaTypeSchema: z.ZodType<T.MediaType> = z.enum(['movie', 'tv']);
export const starsSchema: z.ZodType<T.Stars> = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
const idx = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);

export const avatarSchema: z.ZodType<T.Avatar> = z.object({
  style: z.enum(['short', 'long', 'bun', 'bob']),
  hair: idx,
  skin: idx,
  top: idx,
  extra: z.enum(['none', 'glasses', 'cap']),
});

export const userSchema: z.ZodType<T.User> = z.object({
  id,
  username: z.string(),
  displayName: z.string(),
  avatar: avatarSchema,
  favoriteGenreIds: z.array(z.string()),
  theme: z.enum(['light', 'dark']),
});

export const genreSchema: z.ZodType<T.Genre> = z.object({ id, name: z.string() });
export const personSchema: z.ZodType<T.Person> = z.object({
  id,
  name: z.string(),
  character: z.string().optional(),
});

export const titleSchema: z.ZodType<T.Title> = z.object({
  id,
  tmdbId: nullableNum,
  mediaType: mediaTypeSchema,
  source: z.enum(['tmdb', 'manual']),
  title: z.string(),
  year: nullableNum,
  overview: z.string().nullable(),
  posterUrl: z.string().nullable(),
  runtimeMinutes: nullableNum,
  seasons: nullableNum,
  genres: z.array(genreSchema),
  cast: z.array(personSchema),
});

export const ratingSchema: z.ZodType<T.Rating> = z.object({
  userId: id,
  stars: starsSchema,
  comment: z.string().nullable(),
  updatedAt: timestamp,
});

export const screeningSchema: z.ZodType<T.Screening> = z.object({
  id,
  number: z.number().int(),
  title: titleSchema,
  watchedOn: isoDate.nullable(),
  watchedYear: z.number().int(),
  datePrecision: z.enum(['day', 'year']),
  season: nullableNum,
  viewerIds: z.array(z.string()),
  source: z.enum(['app', 'import']),
  addedBy: z.string(),
  createdAt: timestamp,
  ratings: z.array(ratingSchema),
  averageStars: nullableNum,
  commentCount: z.number().int(),
  hiddenPartnerRating: z.boolean(),
});

export const watchlistItemSchema: z.ZodType<T.WatchlistItem> = z.object({
  id,
  title: titleSchema,
  addedBy: z.string(),
  addedAt: timestamp,
  reactions: z.array(z.object({ userId: z.string(), reaction: z.enum(['want', 'maybe', 'nah']) })),
});

export const recommendationSchema: z.ZodType<T.Recommendation> = z.object({
  title: titleSchema,
  matchPercent: z.number(),
  reason: z.string(),
  forUserId: z.string().nullable(),
});

export const streakSchema: z.ZodType<T.Streak> = z.object({
  current: z.number().int(),
  best: z.number().int(),
  lastWeeks: z.array(z.boolean()),
});

const genreCountSchema: z.ZodType<T.GenreCount> = z.object({ genre: genreSchema, count: z.number() });

export const statsSchema: z.ZodType<T.Stats> = z.object({
  total: z.number(),
  movies: z.number(),
  series: z.number(),
  together: z.number(),
  solo: z.number(),
  topGenre: genreCountSchema.nullable(),
  genres: z.array(genreCountSchema),
  topRated: z.array(z.object({ screening: screeningSchema, stars: z.number() })),
  tasteMatchPercent: nullableNum,
  byMonth: z.array(z.number()),
  undatedCount: z.number(),
  bestStreak: z.number(),
});

export const profileSchema: z.ZodType<T.Profile> = z.object({
  user: userSchema,
  watchedCount: z.number(),
  tasteMatchPercent: nullableNum,
  topFive: z.array(screeningSchema.nullable()),
  watchlistAdded: z.array(watchlistItemSchema),
  recentlyRated: z.array(screeningSchema),
});

export const homeSummarySchema: z.ZodType<T.HomeSummary> = z.object({
  todayCount: z.number(),
  totalCount: z.number(),
  mood: z.string(),
  statusNote: z.string(),
  streak: streakSchema,
  recentlyWatched: z.array(screeningSchema),
  upNext: z.array(watchlistItemSchema),
});

export const importRowSchema: z.ZodType<T.ImportRow> = z.object({
  id,
  rawTitle: z.string(),
  watchedYear: z.number().int(),
  match: titleSchema.nullable(),
  candidates: z.array(titleSchema),
  status: z.enum(['matched', 'needs_review', 'manual', 'skipped', 'imported']),
});

export const movieNightSchema: z.ZodType<T.MovieNight> = z.object({
  id,
  title: titleSchema,
  proposedBy: z.string(),
  date: isoDate,
  status: z.enum(['proposed', 'accepted', 'declined']),
  createdAt: timestamp,
});

export const providerSchema: z.ZodType<T.Provider> = z.object({
  name: z.string(),
  url: z.string().optional(),
});

export const historyEntrySchema: z.ZodType<T.HistoryEntry> = z.object({
  id,
  watchedOn: isoDate.nullable(),
  watchedYear: z.number().int(),
});

// ---- Response envelopes ----

export const listOf = <S extends z.ZodTypeAny>(item: S) =>
  z.object({ items: z.array(item), total: z.number() });
export const itemsOf = <S extends z.ZodTypeAny>(item: S) => z.object({ items: z.array(item) });

export const userEnvelope = z.object({ user: userSchema });
export const meEnvelope = z.object({ user: userSchema, partner: userSchema });
export const titleEnvelope = z.object({ title: titleSchema });
export const screeningEnvelope = z.object({ screening: screeningSchema });
export const screeningDetailSchema = z.object({
  screening: screeningSchema,
  history: z.array(historyEntrySchema),
});
export const calendarSchema = z.object({
  days: z.array(z.object({ date: isoDate, screenings: z.array(screeningSchema) })),
  undatedCount: z.number(),
});
export const recommendationsSchema = z.object({
  top: recommendationSchema.nullable(),
  items: z.array(recommendationSchema),
});
export const noteSchema = z.object({ mood: z.string(), statusNote: z.string() });
export const topFiveEnvelope = z.object({ topFive: z.array(screeningSchema.nullable()) });
export const watchlistItemEnvelope = z.object({ item: watchlistItemSchema });
export const movieNightEnvelope = z.object({ night: movieNightSchema });
export const importRowsEnvelope = z.object({ rows: z.array(importRowSchema) });
export const importRowEnvelope = z.object({ row: importRowSchema });
export const importConfirmSchema = z.object({ imported: z.number(), skipped: z.number() });
export const projectionistSchema = z.object({ reply: z.string(), picks: z.array(recommendationSchema) });
export const wrappedSchema = z.object({ stats: statsSchema, highlights: z.array(z.string()) });
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string()).optional(),
  }),
});
