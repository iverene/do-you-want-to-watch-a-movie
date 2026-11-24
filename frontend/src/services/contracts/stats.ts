import type { Stats, StatsQuery, Streak } from '../types';

export interface StatsService {
  get(q: StatsQuery): Promise<Stats>;
  streak(): Promise<Streak>;
  wrapped(year: number): Promise<{ stats: Stats; highlights: string[] }>;
}
