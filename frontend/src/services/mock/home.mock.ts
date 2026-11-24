import type { HomeService } from '../contracts';
import { ApiError } from '../errors';
import { db, nowIso, save } from './db';
import { coupleStreak } from './logic/couple';
import { compareScreenings } from './logic/scope';
import { toScreening, toWatchlistItem } from './logic/view';
import { sortWatchlist } from './logic/watchlistSort';
import { handle, requireUser, today } from './util';
import { todayIn } from '@/lib/dates';
import { serviceConfig } from '../config';

export const homeMock: HomeService = {
  get: () =>
    handle(() => {
      const { d, me } = requireUser();
      const t = today();
      const mine = d.screenings.filter((s) => s.viewerIds.includes(me.id) && s.datePrecision === 'day');
      const streak = coupleStreak(d);
      save();
      return {
        todayCount: d.screenings.filter((s) => todayIn(serviceConfig.timeZone, new Date(s.createdAt)) === t)
          .length,
        totalCount: d.screenings.length,
        mood: d.note.mood,
        statusNote: d.note.statusNote,
        streak,
        recentlyWatched: [...mine]
          .sort(compareScreenings)
          .slice(0, 3)
          .map((s) => toScreening(d, s, me.id)),
        upNext: sortWatchlist(
          d.watchlist,
          'both_want',
          d.users.map((u) => u.id),
        )
          .slice(0, 2)
          .map((w) => toWatchlistItem(d, w)),
      };
    }),

  setNote: (body) =>
    handle(() => {
      requireUser();
      const d = db();
      if (body.mood !== undefined) {
        if (body.mood.trim().length > 30)
          throw new ApiError('VALIDATION', 'Too long.', { mood: 'Max 30 characters.' });
        d.note.mood = body.mood.trim();
      }
      if (body.statusNote !== undefined) {
        const note = body.statusNote.trim();
        if (note.length > 80)
          throw new ApiError('VALIDATION', 'Too long.', { statusNote: 'Max 80 characters.' });
        if (d.note.statusNote && d.note.statusNote !== note) {
          d.note.history.unshift({ text: d.note.statusNote, at: nowIso() });
          d.note.history = d.note.history.slice(0, 10);
        }
        d.note.statusNote = note;
      }
      save();
      return { mood: d.note.mood, statusNote: d.note.statusNote };
    }),
};
