import type { UsersService } from '../contracts';
import { profileSchema } from '../schemas';
import { request } from './client';

export const usersHttp: UsersService = {
  /** GET /users/:username */
  getProfile: (username) =>
    request('GET', `/users/${encodeURIComponent(username)}`, { schema: profileSchema }),
};
