import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { services, type RecommendationFor, type TypeFilter } from '@/services';

export function useRecommendations(forWhom: RecommendationFor, type: TypeFilter) {
  return useQuery({
    queryKey: ['recommendations', forWhom, type],
    queryFn: () => services.recommendations.get({ for: forWhom, type }),
  });
}

export function useRefreshRecommendations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (forWhom: RecommendationFor) => services.recommendations.refresh({ for: forWhom }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  });
}
