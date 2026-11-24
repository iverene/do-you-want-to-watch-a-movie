import type { AuthService } from '../contracts';
import { meEnvelope, userEnvelope } from '../schemas';
import { request } from './client';

export const authHttp: AuthService = {
  /** POST /auth/login */
  login: (body) => request('POST', '/auth/login', { body, schema: userEnvelope }),
  /** POST /auth/logout */
  logout: () => request('POST', '/auth/logout'),
  /** GET /auth/me */
  me: () => request('GET', '/auth/me', { schema: meEnvelope }),
};
