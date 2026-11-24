import type { HomeService } from '../contracts';
import { homeSummarySchema, noteSchema } from '../schemas';
import { request } from './client';

export const homeHttp: HomeService = {
  /** GET /home */
  get: () => request('GET', '/home', { schema: homeSummarySchema }),
  /** PUT /home/note */
  setNote: (body) => request('PUT', '/home/note', { body, schema: noteSchema }),
};
