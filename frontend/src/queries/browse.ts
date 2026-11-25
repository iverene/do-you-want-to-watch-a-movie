import { useQuery } from '@tanstack/react-query';
import { services, type BrowseQuery } from '@/services';
import { keys } from './keys';

export function useGenres() {
  return useQuery({ queryKey: keys.genres, queryFn: () => services.browse.genres(), staleTime: Infinity });
}

export function useBrowse(q: BrowseQuery, enabled = true) {
  return useQuery({ queryKey: ['browse', q], queryFn: () => services.browse.list(q), enabled });
}
