import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isApiError, services, type LoginBody, type User } from '@/services';
import { keys } from './keys';

export function useMe() {
  return useQuery({
    queryKey: keys.me,
    queryFn: () => services.auth.me(),
    retry: (count, e) => !isApiError(e, 'UNAUTHORIZED') && count < 2,
    staleTime: 5 * 60_000,
  });
}

/** The signed-in pair. Only call below the auth guard, where `me` is loaded. */
export function useSession(): { user: User; partner: User; users: [User, User] } {
  const { data } = useMe();
  if (!data) throw new Error('useSession used outside the auth guard');
  const users = [data.user, data.partner].sort((a, b) => a.id.localeCompare(b.id)) as [User, User];
  return { user: data.user, partner: data.partner, users };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginBody) => services.auth.login(body),
    onSuccess: async () => {
      qc.clear();
      await qc.fetchQuery({ queryKey: keys.me, queryFn: () => services.auth.me() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => services.auth.logout(),
    onSettled: () => qc.clear(),
  });
}
