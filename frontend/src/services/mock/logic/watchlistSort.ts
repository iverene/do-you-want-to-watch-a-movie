import type { WatchlistItem } from '../../types';

export function bothWant(item: Pick<WatchlistItem, 'reactions'>, userIds: string[]): boolean {
  return userIds.every((u) => item.reactions.some((r) => r.userId === u && r.reaction === 'want'));
}

/** `both_want`: items both users reacted "want" to come first, then newest `addedAt`. */
export function sortWatchlist<T extends Pick<WatchlistItem, 'reactions' | 'addedAt'>>(
  items: T[],
  sort: 'both_want' | 'newest',
  userIds: string[],
): T[] {
  return [...items].sort((x, y) => {
    if (sort === 'both_want') {
      const diff = Number(bothWant(y, userIds)) - Number(bothWant(x, userIds));
      if (diff) return diff;
    }
    return y.addedAt.localeCompare(x.addedAt);
  });
}
