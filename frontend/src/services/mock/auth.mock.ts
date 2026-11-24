import type { AuthService } from '../contracts';
import { ApiError } from '../errors';
import { db, save } from './db';
import { clearSession, setSessionUserId } from './session';
import { handle, publicUser, requireUser } from './util';

const MAX_TRIES = 5;
const LOCK_MS = 15 * 60 * 1000;

export const authMock: AuthService = {
  /** POST /auth/login — 5 failed tries lock sign-in for 15 minutes. */
  login: ({ username, password, remember }) =>
    handle(() => {
      const d = db();
      const lock = d.loginFails;
      if (lock.until && Date.parse(lock.until) > Date.now()) {
        throw new ApiError('RATE_LIMITED', 'Too many tries. Wait 15 minutes.');
      }
      const user = d.users.find((u) => u.username === username.trim().toLowerCase());
      if (!user || user.password !== password) {
        lock.count += 1;
        if (lock.count >= MAX_TRIES) {
          lock.until = new Date(Date.now() + LOCK_MS).toISOString();
          lock.count = 0;
          save();
          throw new ApiError('RATE_LIMITED', 'Too many tries. Wait 15 minutes.');
        }
        save();
        throw new ApiError('UNAUTHORIZED', "That username and password don't match.");
      }
      d.loginFails = { count: 0, until: null };
      save();
      setSessionUserId(user.id, remember);
      return { user: publicUser(user) };
    }),

  logout: () =>
    handle(() => {
      clearSession();
    }),

  me: () =>
    handle(() => {
      const { d, me } = requireUser();
      const partner = d.users.find((u) => u.id !== me.id)!;
      return { user: publicUser(me), partner: publicUser(partner) };
    }),
};
