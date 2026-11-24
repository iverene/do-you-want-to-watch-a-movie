import type { ProjectionistService } from '../contracts';
import { projectionistSchema } from '../schemas';
import { request } from './client';

export const projectionistHttp: ProjectionistService = {
  /** POST /projectionist */
  ask: (body) => request('POST', '/projectionist', { body, schema: projectionistSchema }),
};
