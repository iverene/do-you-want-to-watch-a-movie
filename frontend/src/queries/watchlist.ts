import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  services,
  type MarkWatchedBody,
  type RandomQuery,
  type Reaction,
  type WatchlistItem,
  type WatchlistQuery,
} from '@/services';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/services';
import { invalidateWatches } from './keys';

type ListData = { items: WatchlistItem[]; total: number };

export const useWatchlist = (q: WatchlistQuery) =>
  useQuery({ queryKey: ['watchlist', q], queryFn: () => services.watchlist.list(q) });

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (titleId: string) => services.watchlist.add({ titleId }),
    onSuccess: () =>
      Promise.all(
        ['watchlist', 'home', 'recommendations', 'profile'].map((k) =>
          qc.invalidateQueries({ queryKey: [k] }),
        ),
      ),
  });
}

/** Optimistic: the card disappears at once and comes back (with a toast) if the server says no. */
export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => services.watchlist.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['watchlist'] });
      const snapshot = qc.getQueriesData<ListData>({ queryKey: ['watchlist'] });
      qc.setQueriesData<ListData>({ queryKey: ['watchlist'] }, (d) =>
        d ? { items: d.items.filter((i) => i.id !== id), total: d.total - 1 } : d,
      );
      return { snapshot };
    },
    onError: (e, _id, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData<ListData>(key, data));
      toast.show(errorMessage(e), 'error');
    },
    onSettled: () =>
      Promise.all(['watchlist', 'home', 'profile'].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

/** Optimistic reaction change, rolled back with a toast on error. */
export function useReact(userId: string) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, reaction }: { id: string; reaction: Reaction | null }) =>
      services.watchlist.react(id, { reaction }),
    onMutate: async ({ id, reaction }) => {
      await qc.cancelQueries({ queryKey: ['watchlist'] });
      const snapshot = qc.getQueriesData<ListData>({ queryKey: ['watchlist'] });
      qc.setQueriesData<ListData>({ queryKey: ['watchlist'] }, (d) =>
        d
          ? {
              ...d,
              items: d.items.map((i) =>
                i.id !== id
                  ? i
                  : {
                      ...i,
                      reactions: [
                        ...i.reactions.filter((r) => r.userId !== userId),
                        ...(reaction ? [{ userId, reaction }] : []),
                      ],
                    },
              ),
            }
          : d,
      );
      return { snapshot };
    },
    onError: (e, _v, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData<ListData>(key, data));
      toast.show(errorMessage(e), 'error');
    },
    onSettled: () => Promise.all(['watchlist', 'home'].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

export function useMarkWatched() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MarkWatchedBody }) =>
      services.watchlist.markWatched(id, body),
    onSuccess: () => invalidateWatches(qc),
  });
}

export function useRandomPick() {
  return useMutation({ mutationFn: (q: RandomQuery) => services.watchlist.random(q) });
}
