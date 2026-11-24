import type { Title } from '../../types';

/** Match a raw CSV title to the catalog, preferring titles released on or before the watched year. */
export function matchImport(
  titles: Title[],
  rawTitle: string,
  watchedYear: number,
): { match: Title | null; candidates: Title[]; status: 'matched' | 'needs_review' } {
  const needle = rawTitle.trim().toLowerCase();
  const eligible = titles.filter((t) => t.year === null || t.year <= watchedYear);
  const exact = eligible.filter((t) => t.title.toLowerCase() === needle);
  const partial = eligible.filter(
    (t) => t.title.toLowerCase().includes(needle) || needle.includes(t.title.toLowerCase()),
  );
  const candidates = [...new Map([...exact, ...partial].map((t) => [t.id, t])).values()].slice(0, 5);
  if (exact.length === 1) return { match: exact[0], candidates, status: 'matched' };
  return { match: candidates[0] ?? null, candidates, status: 'needs_review' };
}
