import type { BrowseService } from '../contracts';
import type { Title } from '../types';
import { handle, requireUser } from './util';

/** A stable pseudo "vote average" for the made-up catalog. */
function pseudoVote(t: Title): number {
  let h = 0;
  for (const c of t.title) h = (h * 31 + c.charCodeAt(0)) % 1000;
  return 6 + (h % 35) / 10;
}

export const browseMock: BrowseService = {
  genres: () =>
    handle(() => {
      const { d } = requireUser();
      return { items: d.genres };
    }),

  list: ({ category, genreId, type = 'all' }) =>
    handle(() => {
      const { d } = requireUser();
      let items = d.titles.filter(
        (t) =>
          t.source === 'tmdb' &&
          (type === 'all' || t.mediaType === type) &&
          (!genreId || t.genres.some((g) => g.id === genreId)),
      );
      if (category === 'top_rated') items = items.sort((a, b) => pseudoVote(b) - pseudoVote(a));
      else items = items.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));
      return { items: items.slice(0, 10) };
    }),
};
