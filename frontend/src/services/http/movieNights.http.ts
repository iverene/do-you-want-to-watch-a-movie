import type { MovieNightsService } from '../contracts';
import { itemsOf, movieNightEnvelope, movieNightSchema } from '../schemas';
import { request } from './client';

export const movieNightsHttp: MovieNightsService = {
  /** GET /movie-nights */
  list: () => request('GET', '/movie-nights', { schema: itemsOf(movieNightSchema) }),
  /** POST /movie-nights */
  create: (body) => request('POST', '/movie-nights', { body, schema: movieNightEnvelope }),
  /** PATCH /movie-nights/:id */
  update: (id, body) => request('PATCH', `/movie-nights/${id}`, { body, schema: movieNightEnvelope }),
};
