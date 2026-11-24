import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { services, type Profile } from '@/services';

export const useProfile = (username: string | undefined) =>
  useQuery({
    queryKey: ['profile', username],
    queryFn: () => services.users.getProfile(username!),
    enabled: Boolean(username),
  });

export function useSetTopFive(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (screeningIds: (string | null)[]) => services.me.setTopFive({ screeningIds }),
    onSuccess: ({ topFive }) => {
      qc.setQueryData<Profile>(['profile', username], (p) => (p ? { ...p, topFive } : p));
      return qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
