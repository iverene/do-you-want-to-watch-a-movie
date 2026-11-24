import type { WatchlistItem } from '../../types';
import { sortWatchlist } from './watchlistSort';

const item = (id: string, addedAt: string, reactions: WatchlistItem['reactions']) => ({
  id,
  addedAt,
  reactions,
});

describe('sortWatchlist', () => {
  const items = [
    item('old-both', '2026-01-01', [
      { userId: 'a', reaction: 'want' },
      { userId: 'b', reaction: 'want' },
    ]),
    item('new-one', '2026-03-01', [{ userId: 'a', reaction: 'want' }]),
    item('mid-maybe', '2026-02-01', [
      { userId: 'a', reaction: 'want' },
      { userId: 'b', reaction: 'maybe' },
    ]),
  ];

  it('puts both-want first, then newest', () => {
    expect(sortWatchlist(items, 'both_want', ['a', 'b']).map((i) => i.id)).toEqual([
      'old-both',
      'new-one',
      'mid-maybe',
    ]);
  });

  it('sorts by newest only when asked', () => {
    expect(sortWatchlist(items, 'newest', ['a', 'b']).map((i) => i.id)).toEqual([
      'new-one',
      'mid-maybe',
      'old-both',
    ]);
  });
});
