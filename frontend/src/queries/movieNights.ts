import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { services } from '@/services';

export const useMovieNights = () =>
  useQuery({ queryKey: ['movie-nights'], queryFn: () => services.movieNights.list() });

export function usePlanNight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { titleId: string; date: string }) => services.movieNights.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['movie-nights'] }),
  });
}

export function useAnswerNight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'declined' }) =>
      services.movieNights.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['movie-nights'] }),
  });
}
