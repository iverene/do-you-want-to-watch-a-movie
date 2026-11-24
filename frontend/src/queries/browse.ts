import { useQuery } from '@tanstack/react-query';
import { services, type BrowseCategory, type TypeFilter } from '@/services';
import { keys } from './keys';

export function useGenres() {
  return useQuery({ queryKey: keys.genres, queryFn: () => services.browse.genres(), staleTime: Infinity });
}

export function useBrowse(q: { category: BrowseCategory; genreId?: string; type?: TypeFilter }) {
  return useQuery({ queryKey: ['browse', q], queryFn: () => services.browse.list(q) });
}
