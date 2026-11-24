import type { MeService } from '../contracts';
import { topFiveEnvelope, userEnvelope } from '../schemas';
import { request } from './client';

export const meHttp: MeService = {
  /** PATCH /me */
  update: (body) => request('PATCH', '/me', { body, schema: userEnvelope }),
  /** PUT /me/avatar */
  setAvatar: (avatar) => request('PUT', '/me/avatar', { body: avatar, schema: userEnvelope }),
  /** PUT /me/genres */
  setGenres: (body) => request('PUT', '/me/genres', { body, schema: userEnvelope }),
  /** PUT /me/top-five */
  setTopFive: (body) => request('PUT', '/me/top-five', { body, schema: topFiveEnvelope }),
  /** PUT /me/password */
  changePassword: (body) => request('PUT', '/me/password', { body }),
};
