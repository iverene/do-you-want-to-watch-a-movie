import type { WatchlistService } from '../contracts';
import { listOf, screeningEnvelope, watchlistItemEnvelope, watchlistItemSchema } from '../schemas';
import { request } from './client';

export const watchlistHttp: WatchlistService = {
  /** GET /watchlist?type=&addedBy= (newest first) */
  list: (q) => request('GET', '/watchlist', { query: { ...q }, schema: listOf(watchlistItemSchema) }),
  /** POST /watchlist */
  add: (body) => request('POST', '/watchlist', { body, schema: watchlistItemEnvelope }),
  /** DELETE /watchlist/:id */
  remove: (id) => request('DELETE', `/watchlist/${id}`),
  /** POST /watchlist/:id/watched */
  markWatched: (id, body) => request('POST', `/watchlist/${id}/watched`, { body, schema: screeningEnvelope }),
  /** GET /watchlist/random?type=&genreId=&maxRuntime= */
  random: (q) => request('GET', '/watchlist/random', { query: { ...q }, schema: watchlistItemEnvelope }),
};
