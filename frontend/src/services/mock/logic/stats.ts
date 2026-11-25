import type { Genre, Scope, Screening, Stats, StatsQuery } from '../../types';
import type { Db } from '../db';
import { coupleStreak, coupleTasteMatch } from './couple';
import { inScope, scopeRater, scopeUserIds } from './scope';
import { toScreening } from './view';

/**
 * The stars a screening counts with in "Top rated": the average of the visible ratings in `ours`,
 * that user's own visible stars in a personal scope.
 */
export function scopedStars(s: Screening, rater: string | null): number | null {
  if (rater === null) return s.averageStars;
  return s.ratings.find((r) => r.userId === rater)?.stars ?? null;
}

/**
 * Top rated order. Ties on stars are broken by, in turn: rated by both of you before rated by one,
 * the more recent watch (year-only imports count as Jan 1 of their year), then title A to Z.
 * A rewatched title appears once, with its best screening.
 */
export function rankTopRated<T extends { screening: Screening; stars: number }>(rows: T[]): T[] {
  const when = (s: Screening) => s.watchedOn ?? `${s.watchedYear}-01-01`;
  const sorted = [...rows].sort(
    (a, b) =>
      b.stars - a.stars ||
      b.screening.ratings.length - a.screening.ratings.length ||
      when(b.screening).localeCompare(when(a.screening)) ||
      a.screening.title.title.localeCompare(b.screening.title.title),
  );
  const seen = new Set<string>();
  return sorted.filter((r) =>
    seen.has(r.screening.title.id) ? false : (seen.add(r.screening.title.id), true),
  );
}

export function computeStats(d: Db, q: StatsQuery, viewerId: string, currentYear: number): Stats {
  const users = scopeUserIds(d, q.scope, viewerId);
  const rater = scopeRater(q.scope, viewerId);
  const scoped = d.screenings.filter((s) => inScope(s, users));

  const inPeriod = scoped.filter((s) => {
    if (q.year !== undefined && s.watchedYear !== q.year) return false;
    if (q.month !== undefined) return s.watchedOn !== null && Number(s.watchedOn.slice(5, 7)) === q.month;
    return true;
  });
  const views = inPeriod.map((s) => toScreening(d, s, viewerId));
  const bothIds = d.users.map((u) => u.id);
  const together = inPeriod.filter((s) => bothIds.every((id) => s.viewerIds.includes(id))).length;

  const genreCounts = new Map<string, { genre: Genre; count: number }>();
  for (const v of views) {
    for (const g of v.title.genres) {
      const entry = genreCounts.get(g.id) ?? { genre: g, count: 0 };
      entry.count += 1;
      genreCounts.set(g.id, entry);
    }
  }
  const genres = [...genreCounts.values()].sort(
    (a, b) => b.count - a.count || a.genre.name.localeCompare(b.genre.name),
  );

  const topRated = rankTopRated(
    views
      .map((screening) => ({ screening, stars: scopedStars(screening, rater) }))
      .filter((x): x is { screening: Screening; stars: number } => x.stars !== null),
  ).slice(0, 4);

  const chartYear = q.year ?? currentYear;
  const byMonth = Array.from({ length: 12 }, () => 0);
  for (const s of scoped) {
    if (s.watchedYear === chartYear && s.watchedOn) byMonth[Number(s.watchedOn.slice(5, 7)) - 1] += 1;
  }

  return {
    total: views.length,
    movies: views.filter((v) => v.title.mediaType === 'movie').length,
    series: views.filter((v) => v.title.mediaType === 'tv').length,
    together,
    solo: views.length - together,
    topGenre: genres[0] ?? null,
    genres,
    topRated,
    tasteMatchPercent: coupleTasteMatch(d),
    byMonth,
    undatedCount: scoped.filter(
      (s) => s.datePrecision === 'year' && (q.year === undefined || s.watchedYear === q.year),
    ).length,
    bestStreak: coupleStreak(d).best,
  };
}

export function wrappedHighlights(stats: Stats, year: number, scope: Scope): string[] {
  const lines = [`${stats.total} titles in ${year}, ${stats.together} of them together.`];
  if (stats.topGenre) lines.push(`Most-watched genre: ${stats.topGenre.genre.name}.`);
  if (stats.topRated[0]) lines.push(`Highest rated: ${stats.topRated[0].screening.title.title}.`);
  if (stats.tasteMatchPercent !== null && scope === 'ours')
    lines.push(`You agreed ${stats.tasteMatchPercent}% of the time.`);
  lines.push(`Best streak: ${stats.bestStreak} weeks.`);
  return lines;
}
