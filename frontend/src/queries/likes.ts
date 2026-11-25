import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { errorMessage, services, type Title } from '@/services';

const KEY = ['likes'] as const;
type Data = { items: Title[] };

export const useLikes = () => useQuery({ queryKey: KEY, queryFn: () => services.likes.list() });

/** ♡ state for one title, toggled optimistically (rolled back with a toast on error). */
export function useLike(title: Title | undefined): { liked: boolean; toggle: () => void; pending: boolean } {
  const qc = useQueryClient();
  const toast = useToast();
  const likes = useLikes();
  const liked = Boolean(title && likes.data?.items.some((t) => t.id === title.id));
  const m = useMutation({
    mutationFn: ({ t, on }: { t: Title; on: boolean }) =>
      on ? services.likes.like(t.id).then(() => undefined) : services.likes.unlike(t.id),
    onMutate: async ({ t, on }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Data>(KEY);
      qc.setQueryData<Data>(KEY, (d) => ({
        items: on ? [t, ...(d?.items ?? [])] : (d?.items ?? []).filter((x) => x.id !== t.id),
      }));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData<Data | undefined>(KEY, ctx?.prev);
      toast.show(errorMessage(e), 'error');
    },
    onSettled: () =>
      Promise.all([qc.invalidateQueries({ queryKey: KEY }), qc.invalidateQueries({ queryKey: ['profile'] })]),
  });
  return { liked, toggle: () => title && m.mutate({ t: title, on: !liked }), pending: m.isPending };
}
