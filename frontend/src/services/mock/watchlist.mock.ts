import type { WatchlistService } from '../contracts';
import { ApiError } from '../errors';
import { nowIso, save, uid } from './db';
import { createScreening } from './logic/createScreening';
import { titleById, toScreening, toWatchlistItem } from './logic/view';
import { sortWatchlist } from './logic/watchlistSort';
import { handle, requireUser, today } from './util';

export const watchlistMock: WatchlistService = {
  list: ({ type = 'all', addedBy, sort = 'both_want' }) =>
    handle(() => {
      const { d } = requireUser();
      const items = sortWatchlist(
        d.watchlist,
        sort,
        d.users.map((u) => u.id),
      )
        .filter((w) => !addedBy || w.addedBy === addedBy)
        .map((w) => toWatchlistItem(d, w))
        .filter((w) => type === 'all' || w.title.mediaType === type);
      return { items, total: items.length };
    }),

  add: ({ titleId }) =>
    handle(() => {
      const { d, me } = requireUser();
      titleById(d, titleId);
      if (d.watchlist.some((w) => w.titleId === titleId))
        throw new ApiError('CONFLICT', "It's already on the watchlist.");
      const item = { id: uid('w'), titleId, addedBy: me.id, addedAt: nowIso(), reactions: [] };
      d.watchlist.push(item);
      save();
      return { item: toWatchlistItem(d, item) };
    }),

  remove: (id) =>
    handle(() => {
      const { d } = requireUser();
      if (!d.watchlist.some((w) => w.id === id)) throw new ApiError('NOT_FOUND', 'Not on the watchlist.');
      d.watchlist = d.watchlist.filter((w) => w.id !== id);
      save();
    }),

  react: (id, { reaction }) =>
    handle(() => {
      const { d, me } = requireUser();
      const item = d.watchlist.find((w) => w.id === id);
      if (!item) throw new ApiError('NOT_FOUND', 'Not on the watchlist.');
      item.reactions = item.reactions.filter((r) => r.userId !== me.id);
      if (reaction) item.reactions.push({ userId: me.id, reaction });
      save();
      return { item: toWatchlistItem(d, item) };
    }),

  /** POST /watchlist/:id/watched — logs a screening (today, both by default) and removes the item. */
  markWatched: (id, body) =>
    handle(() => {
      const { d, me } = requireUser();
      const item = d.watchlist.find((w) => w.id === id);
      if (!item) throw new ApiError('NOT_FOUND', 'Not on the watchlist.');
      const s = createScreening(d, me.id, { titleId: item.titleId, ...body }, today());
      d.watchlist = d.watchlist.filter((w) => w.id !== id);
      save();
      return { screening: toScreening(d, s, me.id) };
    }),

  random: ({ type = 'all', genreId, maxRuntime }) =>
    handle(() => {
      const { d } = requireUser();
      const pool = d.watchlist
        .map((w) => toWatchlistItem(d, w))
        .filter((w) => type === 'all' || w.title.mediaType === type)
        .filter((w) => !genreId || w.title.genres.some((g) => g.id === genreId))
        .filter((w) => !maxRuntime || (w.title.runtimeMinutes ?? 0) <= maxRuntime);
      if (!pool.length) throw new ApiError('NOT_FOUND', 'Nothing on the watchlist matches.');
      return { item: pool[Math.floor(Math.random() * pool.length)] };
    }),
};
