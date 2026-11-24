import { ApiError } from '../../errors';
import type { Scope } from '../../types';
import type { Db, DbScreening } from '../db';

/** The user ids a scope must include: ours = both, mine = me, <username> = that person. */
export function scopeUserIds(d: Db, scope: Scope, viewerId: string): string[] {
  if (scope === 'ours') return d.users.map((u) => u.id);
  if (scope === 'mine') return [viewerId];
  const user = d.users.find((u) => u.username === scope);
  if (!user) throw new ApiError('VALIDATION', 'Unknown scope.', { scope: 'Use ours, mine or a username.' });
  return [user.id];
}

export function inScope(s: DbScreening, userIds: string[]): boolean {
  return userIds.every((id) => s.viewerIds.includes(id));
}

/** The single user whose own stars count in a personal scope, or null for "ours". */
export function scopeRater(d: Db, scope: Scope, viewerId: string): string | null {
  return scope === 'ours' ? null : scopeUserIds(d, scope, viewerId)[0];
}

/** Newest first; within a year, year-only screenings come after the dated ones. */
export function compareScreenings(a: DbScreening, b: DbScreening): number {
  if (a.watchedYear !== b.watchedYear) return b.watchedYear - a.watchedYear;
  if (a.watchedOn && b.watchedOn && a.watchedOn !== b.watchedOn)
    return b.watchedOn.localeCompare(a.watchedOn);
  if (a.watchedOn && !b.watchedOn) return -1;
  if (!a.watchedOn && b.watchedOn) return 1;
  return b.createdAt.localeCompare(a.createdAt);
}
