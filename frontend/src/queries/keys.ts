import type { QueryClient } from '@tanstack/react-query';

export const keys = {
  me: ['me'] as const,
  home: ['home'] as const,
  genres: ['genres'] as const,
  streak: ['streak'] as const,
};

/** Everything a new or changed screening can affect. */
export function invalidateWatches(qc: QueryClient): Promise<unknown> {
  return Promise.all(
    [
      'home',
      'screenings',
      'screening',
      'calendar',
      'stats',
      'streak',
      'recommendations',
      'watchlist',
      'profile',
      'browse',
    ].map((k) => qc.invalidateQueries({ queryKey: [k] })),
  );
}
