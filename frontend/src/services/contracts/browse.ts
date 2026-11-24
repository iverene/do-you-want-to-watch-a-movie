import type { BrowseCategory, Genre, Title, TypeFilter } from '../types';

export interface BrowseService {
  genres(): Promise<{ items: Genre[] }>;
  list(q: { category: BrowseCategory; genreId?: string; type?: TypeFilter }): Promise<{ items: Title[] }>;
}
