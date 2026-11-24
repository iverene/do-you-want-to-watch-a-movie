import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services, type Avatar, type User } from '@/services';
import { keys } from './keys';

type MeData = { user: User; partner: User };

function useUserMutation<V>(fn: (v: V) => Promise<{ user: User }>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: ({ user }) => {
      qc.setQueryData<MeData>(keys.me, (d) => (d ? { ...d, user } : d));
      return qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export const useUpdateMe = () =>
  useUserMutation((body: { displayName?: string; theme?: 'light' | 'dark' }) => services.me.update(body));
export const useSetAvatar = () => useUserMutation((a: Avatar) => services.me.setAvatar(a));
export const useSetGenres = () =>
  useUserMutation((genreIds: string[]) => services.me.setGenres({ genreIds }));
export const useChangePassword = () =>
  useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) => services.me.changePassword(body),
  });
