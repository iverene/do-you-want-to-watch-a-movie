import type { LikesService } from '../contracts';
import { itemsOf, titleEnvelope, titleSchema } from '../schemas';
import { request } from './client';

export const likesHttp: LikesService = {
  /** GET /me/likes */
  list: () => request('GET', '/me/likes', { schema: itemsOf(titleSchema) }),
  /** PUT /me/likes/:titleId */
  like: (titleId) => request('PUT', `/me/likes/${titleId}`, { schema: titleEnvelope }),
  /** DELETE /me/likes/:titleId */
  unlike: (titleId) => request('DELETE', `/me/likes/${titleId}`),
};
