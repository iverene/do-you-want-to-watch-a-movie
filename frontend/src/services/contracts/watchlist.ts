import type { MarkWatchedBody, RandomQuery, Screening, WatchlistItem, WatchlistQuery } from '../types';

export interface WatchlistService {
  list(q: WatchlistQuery): Promise<{ items: WatchlistItem[]; total: number }>;
  add(body: { titleId: string }): Promise<{ item: WatchlistItem }>;
  remove(id: string): Promise<void>;
  markWatched(id: string, body: MarkWatchedBody): Promise<{ screening: Screening }>;
  random(q: RandomQuery): Promise<{ item: WatchlistItem }>;
}
