import type { MoviesService } from '../contracts';
import { itemsOf, providerSchema, titleEnvelope, titleSchema } from '../schemas';
import { request } from './client';

export const moviesHttp: MoviesService = {
  /** GET /movies/search?q=&type= */
  search: (q, type) => request('GET', '/movies/search', { query: { q, type }, schema: itemsOf(titleSchema) }),
  /** GET /movies/:titleId */
  get: (titleId) => request('GET', `/movies/${titleId}`, { schema: titleEnvelope }),
  /** POST /movies/manual (multipart) */
  createManual: (input) => {
    const form = new FormData();
    form.set('title', input.title);
    input.genreIds.forEach((g) => form.append('genreIds[]', g));
    form.set('mediaType', input.mediaType);
    if (input.year !== undefined) form.set('year', String(input.year));
    if (input.overview) form.set('overview', input.overview);
    if (input.poster) form.set('poster', input.poster);
    else if (input.posterUrl) form.set('posterUrl', input.posterUrl);
    return request('POST', '/movies/manual', { form, schema: titleEnvelope });
  },
  /** GET /movies/:titleId/providers?region= */
  providers: (titleId, region) =>
    request('GET', `/movies/${titleId}/providers`, { query: { region }, schema: itemsOf(providerSchema) }),
};
