import type { BrowseService } from '../contracts';
import { genreSchema, itemsOf, titleSchema } from '../schemas';
import { request } from './client';

export const browseHttp: BrowseService = {
  /** GET /genres */
  genres: () => request('GET', '/genres', { schema: itemsOf(genreSchema) }),
  /** GET /browse?category=&genreId=&type=&titleId= */
  list: (q) => request('GET', '/browse', { query: { ...q }, schema: itemsOf(titleSchema) }),
};
