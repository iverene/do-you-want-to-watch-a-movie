import { ApiError } from '../../errors';
import type { CreateScreeningBody } from '../../types';
import { nowIso, uid, type Db, type DbScreening } from '../db';
import { titleById } from './view';

/** Shared by POST /screenings and POST /watchlist/:id/watched. `today` is in Asia/Manila. */
export function createScreening(
  d: Db,
  userId: string,
  body: CreateScreeningBody,
  today: string,
): DbScreening {
  const title = titleById(d, body.titleId);
  const watchedOn = body.watchedOn ?? today;
  if (watchedOn > today) {
    throw new ApiError('VALIDATION', 'Check the date.', { watchedOn: "That date hasn't happened yet." });
  }
  const allIds = d.users.map((u) => u.id);
  const viewerIds = body.viewerIds?.length ? [...new Set(body.viewerIds)] : allIds;
  if (viewerIds.some((v) => !allIds.includes(v)) || !viewerIds.includes(userId)) {
    throw new ApiError('VALIDATION', 'Check who watched.', { viewerIds: 'Include yourself.' });
  }
  if (body.season !== undefined) {
    if (title.mediaType !== 'tv')
      throw new ApiError('VALIDATION', 'Movies have no seasons.', { season: 'Movies only.' });
    if (body.season < 1 || (title.seasons !== null && body.season > title.seasons)) {
      throw new ApiError('VALIDATION', 'Check the season.', { season: 'That season does not exist.' });
    }
  }
  const s: DbScreening = {
    id: uid('s'),
    number: d.screenings.reduce((m, x) => Math.max(m, x.number), 0) + 1,
    titleId: title.id,
    watchedOn,
    watchedYear: Number(watchedOn.slice(0, 4)),
    datePrecision: 'day',
    season: body.season ?? null,
    viewerIds,
    source: 'app',
    addedBy: userId,
    createdAt: nowIso(),
  };
  d.screenings.push(s);
  return s;
}
