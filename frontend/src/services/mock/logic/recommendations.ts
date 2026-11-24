import type { Recommendation, Title, TypeFilter } from '../../types';
import type { Db } from '../db';

export interface ScoredTitle {
  title: Title;
  score: number;
  reasonTitle: string | null;
  reasonStars: number | null;
  bothLoved: boolean;
}

interface Signal {
  titleId: string;
  stars: number;
  bothFive: boolean;
}

/**
 * Simple weighted sum over genres: each rating adds (stars − 3) to the genre's affinity; a favorite
 * genre adds 1.5. A candidate's score is the sum of the affinities of its genres. Titles already
 * watched by the relevant users (and titles on the watchlist) are never candidates.
 */
export function scoreCandidates(d: Db, forUserId: string | null, type: TypeFilter = 'all'): ScoredTitle[] {
  const userIds = forUserId ? [forUserId] : d.users.map((u) => u.id);
  const signals: Signal[] = [];
  for (const s of d.screenings) {
    const rs = d.ratings.filter((r) => r.screeningId === s.id && userIds.includes(r.userId));
    if (!rs.length) continue;
    const stars = rs.reduce((a, r) => a + r.stars, 0) / rs.length;
    signals.push({ titleId: s.titleId, stars, bothFive: rs.length === 2 && rs.every((r) => r.stars === 5) });
  }

  const affinity = new Map<string, number>();
  const titleOf = (id: string) => d.titles.find((t) => t.id === id)!;
  for (const sig of signals) {
    for (const g of titleOf(sig.titleId).genres)
      affinity.set(g.id, (affinity.get(g.id) ?? 0) + (sig.stars - 3));
  }
  for (const u of d.users.filter((x) => userIds.includes(x.id))) {
    for (const g of u.favoriteGenreIds) affinity.set(g, (affinity.get(g) ?? 0) + 1.5);
  }

  const watched = new Set(
    d.screenings.filter((s) => s.viewerIds.some((v) => userIds.includes(v))).map((s) => s.titleId),
  );
  const listed = new Set(d.watchlist.map((w) => w.titleId));

  return d.titles
    .filter((t) => !watched.has(t.id) && !listed.has(t.id) && (type === 'all' || t.mediaType === type))
    .map((title) => {
      const score = title.genres.reduce((a, g) => a + (affinity.get(g.id) ?? 0), 0);
      const best = signals
        .filter((sig) => titleOf(sig.titleId).genres.some((g) => title.genres.some((x) => x.id === g.id)))
        .sort((a, b) => b.stars - a.stars || Number(b.bothFive) - Number(a.bothFive))[0];
      return {
        title,
        score,
        reasonTitle: best && best.stars >= 4 ? titleOf(best.titleId).title : null,
        reasonStars: best ? Math.round(best.stars) : null,
        bothLoved: Boolean(best?.bothFive),
      };
    })
    .sort((a, b) => b.score - a.score || a.title.title.localeCompare(b.title.title));
}

export function matchPercent(score: number, maxScore: number): number {
  if (maxScore <= 0) return 60;
  return Math.max(55, Math.min(98, Math.round(60 + (Math.max(score, 0) / maxScore) * 38)));
}

export function reasonFor(s: ScoredTitle, forBoth: boolean): string {
  if (s.reasonTitle && forBoth && s.bothLoved) return `because you both rated ${s.reasonTitle} 5 stars`;
  if (s.reasonTitle && forBoth) return `because you both liked ${s.reasonTitle}`;
  if (s.reasonTitle) return `because you gave ${s.reasonTitle} ${s.reasonStars} stars`;
  const genre = s.title.genres[0]?.name.toLowerCase() ?? 'something new';
  return forBoth ? `a ${genre} pick for both of you` : `a ${genre} pick, just for you`;
}

/** Rank, rotate by the refresh counter, and shape into the API result. */
export function buildRecommendations(
  d: Db,
  forUserId: string | null,
  type: TypeFilter,
  rotation: number,
  limit = 20,
): { top: Recommendation | null; items: Recommendation[] } {
  const scored = scoreCandidates(d, forUserId, type);
  const max = scored[0]?.score ?? 0;
  const pool = scored.slice(0, Math.max(limit + 1, 8));
  const shift = pool.length ? (rotation * 3) % pool.length : 0;
  const rotated = [...pool.slice(shift), ...pool.slice(0, shift)];
  const recs = rotated.map<Recommendation>((s) => ({
    title: structuredClone(s.title),
    matchPercent: matchPercent(s.score, max),
    reason: reasonFor(s, forUserId === null),
    forUserId,
  }));
  return { top: recs[0] ?? null, items: recs.slice(1, limit + 1) };
}
