import { useMutation, useQuery } from '@tanstack/react-query';
import { services, type ManualTitleInput, type TypeFilter } from '@/services';

export function useSearch(q: string, type: TypeFilter) {
  return useQuery({
    queryKey: ['search', q, type],
    queryFn: () => services.movies.search(q, type),
    enabled: q.trim().length > 0,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateManual() {
  return useMutation({ mutationFn: (input: ManualTitleInput) => services.movies.createManual(input) });
}
