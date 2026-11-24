import type { StatsService } from '../contracts';
import { save } from './db';
import { coupleStreak } from './logic/couple';
import { computeStats, wrappedHighlights } from './logic/stats';
import { handle, requireUser, today } from './util';

export const statsMock: StatsService = {
  get: (q) =>
    handle(() => {
      const { d, me } = requireUser();
      const stats = computeStats(d, q, me.id, Number(today().slice(0, 4)));
      save();
      return stats;
    }),

  streak: () =>
    handle(() => {
      const { d } = requireUser();
      const streak = coupleStreak(d);
      save();
      return streak;
    }),

  wrapped: (year) =>
    handle(() => {
      const { d, me } = requireUser();
      const stats = computeStats(d, { scope: 'ours', year }, me.id, year);
      return { stats, highlights: wrappedHighlights(stats, year, 'ours') };
    }),
};
