import type { Stars } from '../../types';

export interface PairedRating {
  titleId: string;
  a: Stars;
  b: Stars;
}

/**
 * Taste match (S3): of the titles both users rated, the share where the two ratings differ by at
 * most 1 star, as a whole percent. Rewatches count once per title (the latest pair wins).
 */
export function tasteMatch(pairs: PairedRating[]): number | null {
  const byTitle = new Map<string, PairedRating>();
  for (const p of pairs) byTitle.set(p.titleId, p);
  if (byTitle.size === 0) return null;
  const close = [...byTitle.values()].filter((p) => Math.abs(p.a - p.b) <= 1).length;
  return Math.round((close / byTitle.size) * 100);
}
