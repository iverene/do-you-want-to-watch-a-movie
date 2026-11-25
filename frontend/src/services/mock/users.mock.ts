import type { UsersService } from '../contracts';
import { ApiError } from '../errors';
import { coupleTasteMatch } from './logic/couple';
import { titleById, toScreening, toWatchlistItem } from './logic/view';
import { handle, publicUser, requireUser } from './util';

export const usersMock: UsersService = {
  getProfile: (username) =>
    handle(() => {
      const { d, me } = requireUser();
      const user = d.users.find((u) => u.username === username);
      if (!user) throw new ApiError('NOT_FOUND', 'No one here by that name.');
      const watched = d.screenings.filter((s) => s.viewerIds.includes(user.id));
      const topFive = [0, 1, 2, 3, 4].map((i) => {
        const sid = user.topFive[i];
        const s = sid ? d.screenings.find((x) => x.id === sid) : undefined;
        return s ? toScreening(d, s, me.id) : null;
      });
      const recentlyRated = d.ratings
        .filter((r) => r.userId === user.id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((r) => toScreening(d, d.screenings.find((s) => s.id === r.screeningId)!, me.id))
        .filter((s) => s.ratings.some((r) => r.userId === user.id)) // blind rating still applies
        .slice(0, 3);
      return {
        user: publicUser(user),
        watchedCount: watched.length,
        tasteMatchPercent: coupleTasteMatch(d),
        topFive,
        watchlistAdded: d.watchlist
          .filter((w) => w.addedBy === user.id)
          .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
          .map((w) => toWatchlistItem(d, w)),
        recentlyRated,
        liked: d.likes
          .filter((l) => l.userId === user.id)
          .sort((a, b) => b.likedAt.localeCompare(a.likedAt))
          .map((l) => structuredClone(titleById(d, l.titleId))),
      };
    }),
};
