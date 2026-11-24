import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { services, type HomeSummary } from '@/services';
import { keys } from './keys';

export function useHome() {
  return useQuery({ queryKey: keys.home, queryFn: () => services.home.get() });
}

export function useSetNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { mood?: string; statusNote?: string }) => services.home.setNote(body),
    onSuccess: (note) => qc.setQueryData<HomeSummary>(keys.home, (h) => (h ? { ...h, ...note } : h)),
  });
}

export function useStreak() {
  return useQuery({ queryKey: keys.streak, queryFn: () => services.stats.streak() });
}
