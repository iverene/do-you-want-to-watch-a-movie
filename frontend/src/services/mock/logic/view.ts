import { ApiError } from '../../errors';
import type { Rating, Screening, Title, WatchlistItem } from '../../types';
import type { Db, DbScreening, DbWatchlistItem } from '../db';
import { visibleRatings } from './blindRating';

export function titleById(d: Db, id: string): Title {
  const t = d.titles.find((x) => x.id === id);
  if (!t) throw new ApiError('NOT_FOUND', 'That title is not in the catalog.');
  return t;
}

export function rawRatings(d: Db, screeningId: string): Rating[] {
  return d.ratings
    .filter((r) => r.screeningId === screeningId)
    .map(({ userId, stars, comment, updatedAt }) => ({ userId, stars, comment, updatedAt }));
}

/** Build the API Screening for one viewer, applying the blind rating rule. */
export function toScreening(d: Db, s: DbScreening, viewerId: string): Screening {
  const v = visibleRatings(rawRatings(d, s.id), viewerId);
  return {
    id: s.id,
    number: s.number,
    title: structuredClone(titleById(d, s.titleId)),
    watchedOn: s.watchedOn,
    watchedYear: s.watchedYear,
    datePrecision: s.datePrecision,
    season: s.season,
    viewerIds: [...s.viewerIds],
    source: s.source,
    addedBy: s.addedBy,
    createdAt: s.createdAt,
    ratings: v.ratings,
    averageStars: v.averageStars,
    commentCount: v.ratings.filter((r) => r.comment).length,
    hiddenPartnerRating: v.hidden,
  };
}

export function toWatchlistItem(d: Db, w: DbWatchlistItem): WatchlistItem {
  return {
    id: w.id,
    title: structuredClone(titleById(d, w.titleId)),
    addedBy: w.addedBy,
    addedAt: w.addedAt,
  };
}

export function partnerId(d: Db, userId: string): string {
  return d.users.find((u) => u.id !== userId)!.id;
}

export function screeningById(d: Db, id: string): DbScreening {
  const s = d.screenings.find((x) => x.id === id);
  if (!s) throw new ApiError('NOT_FOUND', 'That screening does not exist.');
  return s;
}

/** A screening the viewer watched. The partner's solo screenings answer 404, like missing ones. */
export function viewableScreening(d: Db, id: string, viewerId: string): DbScreening {
  const s = screeningById(d, id);
  if (!s.viewerIds.includes(viewerId)) throw new ApiError('NOT_FOUND', 'That screening does not exist.');
  return s;
}
