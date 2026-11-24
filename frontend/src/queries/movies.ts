import { useMutation, useQuery } from '@tanstack/react-query';
import { serviceConfig, services, type ManualTitleInput, type TypeFilter } from '@/services';

export function useSearch(q: string, type: TypeFilter) {
  return useQuery({
    queryKey: ['search', q, type],
    queryFn: () => services.movies.search(q, type),
    enabled: q.trim().length > 0,
    staleTime: 60_000,
    retry: false,
  });
}

export function useProviders(titleId: string | undefined) {
  return useQuery({
    queryKey: ['providers', titleId],
    queryFn: () => services.movies.providers(titleId!, serviceConfig.region),
    enabled: Boolean(titleId),
    staleTime: 10 * 60_000,
  });
}

export function useCreateManual() {
  return useMutation({ mutationFn: (input: ManualTitleInput) => services.movies.createManual(input) });
}
