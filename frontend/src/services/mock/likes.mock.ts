import type { LikesService } from '../contracts';
import { nowIso, save } from './db';
import { titleById } from './logic/view';
import { handle, requireUser } from './util';

export const likesMock: LikesService = {
  /** Newest like first. */
  list: () =>
    handle(() => {
      const { d, me } = requireUser();
      const items = d.likes
        .filter((l) => l.userId === me.id)
        .sort((a, b) => b.likedAt.localeCompare(a.likedAt))
        .map((l) => structuredClone(titleById(d, l.titleId)));
      return { items };
    }),

  /** Idempotent: liking twice keeps one like. */
  like: (titleId) =>
    handle(() => {
      const { d, me } = requireUser();
      const title = titleById(d, titleId);
      if (!d.likes.some((l) => l.userId === me.id && l.titleId === titleId)) {
        d.likes.push({ userId: me.id, titleId, likedAt: nowIso() });
        save();
      }
      return { title: structuredClone(title) };
    }),

  unlike: (titleId) =>
    handle(() => {
      const { d, me } = requireUser();
      d.likes = d.likes.filter((l) => !(l.userId === me.id && l.titleId === titleId));
      save();
    }),
};
