import { todayIn } from '@/lib/dates';
import { serviceConfig } from '../../config';
import type { Streak } from '../../types';
import type { Db } from '../db';
import { computeStreak } from './streak';
import { tasteMatch, type PairedRating } from './tasteMatch';

export function coupleStreak(d: Db, today = todayIn(serviceConfig.timeZone)): Streak {
  const ids = d.users.map((u) => u.id);
  const dates = d.screenings
    .filter((s) => s.datePrecision === 'day' && s.watchedOn && ids.every((id) => s.viewerIds.includes(id)))
    .map((s) => s.watchedOn!);
  const streak = computeStreak(dates, today, d.bestStreak);
  d.bestStreak = streak.best;
  return streak;
}

export function coupleTasteMatch(d: Db): number | null {
  const [a, b] = d.users.map((u) => u.id);
  const pairs: PairedRating[] = [];
  const ordered = [...d.screenings].sort((x, y) => x.createdAt.localeCompare(y.createdAt));
  for (const s of ordered) {
    const ra = d.ratings.find((r) => r.screeningId === s.id && r.userId === a);
    const rb = d.ratings.find((r) => r.screeningId === s.id && r.userId === b);
    if (ra && rb) pairs.push({ titleId: s.titleId, a: ra.stars, b: rb.stars });
  }
  return tasteMatch(pairs);
}
