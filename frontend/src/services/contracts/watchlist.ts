import type {
  MarkWatchedBody,
  RandomQuery,
  Reaction,
  Screening,
  WatchlistItem,
  WatchlistQuery,
} from '../types';

export interface WatchlistService {
  list(q: WatchlistQuery): Promise<{ items: WatchlistItem[]; total: number }>;
  add(body: { titleId: string }): Promise<{ item: WatchlistItem }>;
  remove(id: string): Promise<void>;
  react(id: string, body: { reaction: Reaction | null }): Promise<{ item: WatchlistItem }>;
  markWatched(id: string, body: MarkWatchedBody): Promise<{ screening: Screening }>;
  random(q: RandomQuery): Promise<{ item: WatchlistItem }>;
}
