import type { StatsService } from '../contracts';
import { statsSchema, streakSchema, wrappedSchema } from '../schemas';
import { request } from './client';

export const statsHttp: StatsService = {
  /** GET /stats?scope=&year=&month= */
  get: (q) => request('GET', '/stats', { query: { ...q }, schema: statsSchema }),
  /** GET /streak */
  streak: () => request('GET', '/streak', { schema: streakSchema }),
  /** GET /wrapped?year= */
  wrapped: (year) => request('GET', '/wrapped', { query: { year }, schema: wrappedSchema }),
};
