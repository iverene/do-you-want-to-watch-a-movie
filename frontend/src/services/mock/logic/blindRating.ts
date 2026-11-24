import type { Rating } from '../../types';

/**
 * Blind rating (S2): if the partner rated but the viewer hasn't, the partner's rating is omitted,
 * `hidden` is true, and the average uses only the visible ratings.
 */
export function visibleRatings(
  ratings: Rating[],
  viewerId: string,
): { ratings: Rating[]; hidden: boolean; averageStars: number | null } {
  const viewerRated = ratings.some((r) => r.userId === viewerId);
  const visible = viewerRated ? ratings : ratings.filter((r) => r.userId === viewerId);
  const hidden = !viewerRated && ratings.length > 0;
  return { ratings: visible, hidden, averageStars: average(visible.map((r) => r.stars)) };
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
