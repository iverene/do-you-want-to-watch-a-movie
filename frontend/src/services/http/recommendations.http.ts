import type { RecommendationsService } from '../contracts';
import { recommendationsSchema } from '../schemas';
import { request } from './client';

export const recommendationsHttp: RecommendationsService = {
  /** GET /recommendations?for=&type= */
  get: (q) =>
    request('GET', '/recommendations', {
      query: { for: q.for, type: q.type },
      schema: recommendationsSchema,
    }),
  /** POST /recommendations/refresh */
  refresh: (body) => request('POST', '/recommendations/refresh', { body, schema: recommendationsSchema }),
};
