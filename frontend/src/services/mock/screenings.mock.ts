import type { ScreeningsService } from '../contracts';
import { ApiError } from '../errors';
import { nowIso, save } from './db';
import { createScreening } from './logic/createScreening';
import { compareScreenings, inScope, scopeRater, scopeUserIds } from './logic/scope';
import { scopedStars } from './logic/stats';
import { screeningById, toScreening } from './logic/view';
import { assertDate, assertNotFuture, handle, requireUser, today } from './util';

export const screeningsMock: ScreeningsService = {
  list: (f) =>
    handle(() => {
      const { d, me } = requireUser();
      const users = scopeUserIds(d, f.scope, me.id);
      const rater = scopeRater(d, f.scope, me.id);
      const all = d.screenings
        .filter((s) => inScope(s, users))
        .filter((s) => f.year === undefined || s.watchedYear === f.year)
        .sort(compareScreenings)
        .map((s) => toScreening(d, s, me.id))
        .filter((s) => !f.genreId || s.title.genres.some((g) => g.id === f.genreId))
        .filter((s) => !f.type || f.type === 'all' || s.title.mediaType === f.type)
        .filter((s) => !f.minStars || (scopedStars(s, rater) ?? 0) >= f.minStars);
      const page = f.page ?? 1;
      const size = f.pageSize ?? 200;
      return { items: all.slice((page - 1) * size, page * size), total: all.length };
    }),

  calendar: (month, scope) =>
    handle(() => {
      const { d, me } = requireUser();
      if (!/^\d{4}-\d{2}$/.test(month))
        throw new ApiError('VALIDATION', 'Check the month.', { month: 'Use YYYY-MM.' });
      const users = scopeUserIds(d, scope, me.id);
      const scoped = d.screenings.filter((s) => inScope(s, users));
      const byDay = new Map<string, typeof scoped>();
      for (const s of scoped) {
        if (!s.watchedOn?.startsWith(month)) continue;
        byDay.set(s.watchedOn, [...(byDay.get(s.watchedOn) ?? []), s]);
      }
      const days = [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, list]) => ({
          date,
          screenings: list
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((s) => toScreening(d, s, me.id)),
        }));
      const year = Number(month.slice(0, 4));
      return {
        days,
        undatedCount: scoped.filter((s) => s.datePrecision === 'year' && s.watchedYear === year).length,
      };
    }),

  get: (id) =>
    handle(() => {
      const { d, me } = requireUser();
      const s = screeningById(d, id);
      const history = d.screenings
        .filter((x) => x.titleId === s.titleId)
        .sort(compareScreenings)
        .map(({ id: hid, watchedOn, watchedYear }) => ({ id: hid, watchedOn, watchedYear }));
      return { screening: toScreening(d, s, me.id), history };
    }),

  /** POST /screenings — watchedOn defaults to today in Asia/Manila, viewers to both. */
  create: (body) =>
    handle(() => {
      const { d, me } = requireUser();
      if (body.watchedOn) assertDate(body.watchedOn);
      const s = createScreening(d, me.id, body, today());
      save();
      return { screening: toScreening(d, s, me.id) };
    }),

  update: (id, body) =>
    handle(() => {
      const { d, me } = requireUser();
      const s = screeningById(d, id);
      if (body.watchedOn !== undefined) {
        assertNotFuture(body.watchedOn);
        s.watchedOn = body.watchedOn;
        s.watchedYear = Number(body.watchedOn.slice(0, 4));
        s.datePrecision = 'day';
      }
      if (body.viewerIds !== undefined) {
        const ids = d.users.map((u) => u.id);
        if (!body.viewerIds.length || body.viewerIds.some((v) => !ids.includes(v))) {
          throw new ApiError('VALIDATION', 'Check who watched.', { viewerIds: 'Pick one or both of you.' });
        }
        s.viewerIds = [...new Set(body.viewerIds)];
      }
      if (body.season !== undefined) s.season = body.season;
      save();
      return { screening: toScreening(d, s, me.id) };
    }),

  remove: (id) =>
    handle(() => {
      const { d } = requireUser();
      screeningById(d, id);
      d.screenings = d.screenings.filter((s) => s.id !== id);
      d.ratings = d.ratings.filter((r) => r.screeningId !== id);
      for (const u of d.users) u.topFive = u.topFive.map((x) => (x === id ? null : x));
      save();
    }),

  rate: (id, body) =>
    handle(() => {
      const { d, me } = requireUser();
      const s = screeningById(d, id);
      if (!s.viewerIds.includes(me.id))
        throw new ApiError('FORBIDDEN', 'You can only rate what you watched.');
      if (![1, 2, 3, 4, 5].includes(body.stars)) {
        throw new ApiError('VALIDATION', 'Pick 1 to 5 stars.', { stars: 'Pick 1 to 5 stars.' });
      }
      const comment = body.comment?.trim() || null;
      if (comment && comment.length > 500)
        throw new ApiError('VALIDATION', 'Too long.', { comment: 'Max 500 characters.' });
      const existing = d.ratings.find((r) => r.screeningId === id && r.userId === me.id);
      if (existing) Object.assign(existing, { stars: body.stars, comment, updatedAt: nowIso() });
      else
        d.ratings.push({ screeningId: id, userId: me.id, stars: body.stars, comment, updatedAt: nowIso() });
      save();
      return { screening: toScreening(d, s, me.id) };
    }),
};
