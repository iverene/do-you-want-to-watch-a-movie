import type { ScreeningsService } from '../contracts';
import {
  calendarSchema,
  listOf,
  screeningDetailSchema,
  screeningEnvelope,
  screeningSchema,
} from '../schemas';
import { request } from './client';

export const screeningsHttp: ScreeningsService = {
  /** GET /screenings?scope=&year=&genreId=&minStars=&type=&page=&pageSize= */
  list: (f) => request('GET', '/screenings', { query: { ...f }, schema: listOf(screeningSchema) }),
  /** GET /screenings/calendar?month=&scope= */
  calendar: (month, scope) =>
    request('GET', '/screenings/calendar', { query: { month, scope }, schema: calendarSchema }),
  /** GET /screenings/:id */
  get: (id) => request('GET', `/screenings/${id}`, { schema: screeningDetailSchema }),
  /** POST /screenings */
  create: (body) => request('POST', '/screenings', { body, schema: screeningEnvelope }),
  /** PATCH /screenings/:id */
  update: (id, body) => request('PATCH', `/screenings/${id}`, { body, schema: screeningEnvelope }),
  /** DELETE /screenings/:id */
  remove: (id) => request('DELETE', `/screenings/${id}`),
  /** PUT /screenings/:id/rating */
  rate: (id, body) => request('PUT', `/screenings/${id}/rating`, { body, schema: screeningEnvelope }),
};
