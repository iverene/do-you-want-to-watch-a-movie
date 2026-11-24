import { todayIn } from '@/lib/dates';
import { serviceConfig } from '../config';
import { ApiError } from '../errors';
import { db, type Db, type DbUser } from './db';
import { getSessionUserId } from './session';

/** Fake network delay so loading states are visible. */
export function delay(ms = serviceConfig.mockLatencyMs): Promise<void> {
  return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
}

/** Every mock route except login needs a session, like the real API. */
export function requireUser(): { d: Db; me: DbUser } {
  const id = getSessionUserId();
  const d = db();
  const me = id ? d.users.find((u) => u.id === id) : undefined;
  if (!me) throw new ApiError('UNAUTHORIZED', 'Please sign in.');
  return { d, me };
}

/** Run a handler after the fake latency; results are deep-copied so callers can't mutate the db. */
export async function handle<T>(fn: () => T | Promise<T>): Promise<T> {
  await delay();
  const out = await fn();
  return out === undefined ? out : structuredClone(out);
}

export function today(): string {
  return todayIn(serviceConfig.timeZone);
}

export function assertDate(value: string, field = 'watchedOn'): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new ApiError('VALIDATION', 'Check the date.', { [field]: 'Use a valid date (YYYY-MM-DD).' });
  }
}

export function assertNotFuture(value: string, field = 'watchedOn'): void {
  assertDate(value, field);
  if (value > today())
    throw new ApiError('VALIDATION', 'Check the date.', { [field]: "That date hasn't happened yet." });
}

export function publicUser(u: DbUser) {
  const { id, username, displayName, avatar, favoriteGenreIds, theme } = u;
  return { id, username, displayName, avatar, favoriteGenreIds, theme };
}

export function readFileText(file: Blob): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

export function readFileDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
