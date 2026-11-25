import type { BrowseService } from '../contracts';
import { ApiError } from '../errors';
import type { Title } from '../types';
import { titleById } from './logic/view';
import { handle, requireUser } from './util';

/** A stable pseudo number in [0, 1) from a title, so the made-up catalog has steady rankings. */
function hash(t: Title, salt: number): number {
  let h = salt;
  for (const c of t.title) h = (h * 31 + c.charCodeAt(0)) % 100003;
  return h / 100003;
}
/** Pseudo TMDB vote average, 6.0 to 9.4. */
export const pseudoVote = (t: Title) => 6 + Math.round(hash(t, 7) * 34) / 10;
/** Pseudo popularity: newer titles trend more. */
const pseudoPopularity = (t: Title) => hash(t, 13) + ((t.year ?? 2000) - 2000) / 10;

const byTitle = (a: Title, b: Title) => a.title.localeCompare(b.title);
const LIMIT = 12;

export const browseMock: BrowseService = {
  genres: () =>
    handle(() => {
      const { d } = requireUser();
      return { items: d.genres };
    }),

  /** Titles you have already watched are never listed. */
  list: ({ category, genreId, type = 'all', titleId }) =>
    handle(() => {
      const { d, me } = requireUser();
      const watched = new Set(d.screenings.filter((s) => s.viewerIds.includes(me.id)).map((s) => s.titleId));
      let items = d.titles.filter(
        (t) =>
          t.source === 'tmdb' &&
          !watched.has(t.id) &&
          (type === 'all' || t.mediaType === type) &&
          (!genreId || t.genres.some((g) => g.id === genreId)),
      );

      if (category === 'because') {
        if (!titleId) throw new ApiError('VALIDATION', 'Pick a title.', { titleId: 'Required for because.' });
        const base = titleById(d, titleId);
        const shared = (t: Title) => t.genres.filter((g) => base.genres.some((b) => b.id === g.id)).length;
        items = items
          .filter((t) => t.id !== base.id && shared(t) > 0)
          .sort((a, b) => shared(b) - shared(a) || pseudoVote(b) - pseudoVote(a) || byTitle(a, b));
      } else if (category === 'top_rated') {
        items = items.sort((a, b) => pseudoVote(b) - pseudoVote(a) || byTitle(a, b));
      } else if (category === 'new_releases') {
        items = items.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || byTitle(a, b));
      } else {
        items = items.sort((a, b) => pseudoPopularity(b) - pseudoPopularity(a) || byTitle(a, b));
      }
      return { items: items.slice(0, LIMIT).map((t) => structuredClone(t)) };
    }),
};
