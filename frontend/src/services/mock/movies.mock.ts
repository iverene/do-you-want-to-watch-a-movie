import type { MoviesService } from '../contracts';
import { ApiError } from '../errors';
import type { Title } from '../types';
import { save, uid } from './db';
import { searchTitles } from './logic/search';
import { titleById } from './logic/view';
import { handle, readFileDataUrl, requireUser } from './util';

const MAX_POSTER_BYTES = 1_500_000;

export const moviesMock: MoviesService = {
  /** Type "!offline" to see how the UI handles the movie API being down (502 UPSTREAM). */
  search: (q, type) =>
    handle(() => {
      const { d } = requireUser();
      if (q.trim() === '!offline') throw new ApiError('UPSTREAM', 'Search is taking a break.');
      return { items: searchTitles(d.titles, q, type) };
    }),

  get: (titleId) =>
    handle(() => {
      const { d } = requireUser();
      return { title: titleById(d, titleId) };
    }),

  createManual: async (input) => {
    const { d } = requireUser();
    const fields: Record<string, string> = {};
    const name = input.title.trim();
    if (!name) fields.title = 'Add a title.';
    if (!input.genreIds.length) fields.genreIds = 'Pick at least one genre.';
    if (input.year !== undefined && (input.year < 1888 || input.year > 2100)) fields.year = 'Check the year.';
    if (input.poster && input.poster.size > MAX_POSTER_BYTES) fields.poster = 'Use an image under 1.5 MB.';
    if (input.posterUrl && !/^(https?:\/\/|data:image\/)/.test(input.posterUrl))
      fields.posterUrl = 'Use an image link.';
    if (Object.keys(fields).length) throw new ApiError('VALIDATION', 'Check the form.', fields);

    const posterUrl = input.poster ? await readFileDataUrl(input.poster) : (input.posterUrl ?? null);
    return handle(() => {
      const title: Title = {
        id: uid('t'),
        tmdbId: null,
        mediaType: input.mediaType,
        source: 'manual',
        title: name,
        year: input.year ?? null,
        overview: input.overview?.trim() || null,
        posterUrl,
        runtimeMinutes: null,
        seasons: null,
        genres: d.genres.filter((g) => input.genreIds.includes(g.id)),
        cast: [],
      };
      d.titles.push(title);
      save();
      return { title };
    });
  },
};
