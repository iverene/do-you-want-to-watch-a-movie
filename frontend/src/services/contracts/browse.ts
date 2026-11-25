import type { BrowseQuery, Genre, Title } from '../types';

export interface BrowseService {
  genres(): Promise<{ items: Genre[] }>;
  list(q: BrowseQuery): Promise<{ items: Title[] }>;
}
