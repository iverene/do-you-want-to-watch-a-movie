import { shiftDays, weekStart } from '@/lib/dates';
import type { Streak } from '../../types';

/**
 * Streak (R16): consecutive ISO weeks (Mon–Sun) ending this week or last week with at least one
 * screening watched together with an exact day. `sharedDates` must already be filtered to those.
 */
export function computeStreak(sharedDates: string[], today: string, storedBest = 0): Streak {
  const weeks = new Set(sharedDates.map(weekStart));
  const thisWeek = weekStart(today);

  const lastWeeks = Array.from({ length: 8 }, (_, i) => weeks.has(shiftDays(thisWeek, (i - 7) * 7)));

  let start = weeks.has(thisWeek) ? thisWeek : shiftDays(thisWeek, -7);
  let current = 0;
  while (weeks.has(start)) {
    current += 1;
    start = shiftDays(start, -7);
  }

  return { current, best: Math.max(storedBest, current, longestRun(weeks)), lastWeeks };
}

function longestRun(weeks: Set<string>): number {
  let best = 0;
  for (const w of weeks) {
    if (weeks.has(shiftDays(w, -7))) continue; // not the start of a run
    let len = 0;
    let cursor = w;
    while (weeks.has(cursor)) {
      len += 1;
      cursor = shiftDays(cursor, 7);
    }
    best = Math.max(best, len);
  }
  return best;
}
