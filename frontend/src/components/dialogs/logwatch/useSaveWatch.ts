import { useLogWatch } from '@/app/LogWatchContext';
import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/queries/auth';
import { useCreateScreening } from '@/queries/screenings';
import { useAddToWatchlist } from '@/queries/watchlist';
import { errorMessage, isApiError, type Title } from '@/services';
import type { WatchDetailsValue } from './WatchDetails';

/** Save the chosen title as a screening (→ rate step) or, in watchlist mode, add it to the watchlist. */
export function useSaveWatch(mode: 'log' | 'watchlist', onFieldErrors: (f: Record<string, string>) => void) {
  const { user } = useSession();
  const { open, close } = useLogWatch();
  const toast = useToast();
  const create = useCreateScreening();
  const add = useAddToWatchlist();

  const save = (title: Title, d: WatchDetailsValue) => {
    if (mode === 'watchlist') {
      add.mutate(title.id, {
        onSuccess: () => {
          toast.show(`${title.title} is on the watchlist`);
          close();
        },
        onError: (e) => toast.show(errorMessage(e), 'error'),
      });
      return;
    }
    create.mutate(
      {
        titleId: title.id,
        watchedOn: d.watchedOn,
        viewerIds: d.who === 'me' ? [user.id] : undefined,
        season: d.season ? Number(d.season) : undefined,
      },
      {
        onSuccess: ({ screening }) => open({ mode: 'rate', screening, justSaved: true }),
        onError: (e) => {
          if (isApiError(e) && e.fields) onFieldErrors(e.fields);
          else toast.show(errorMessage(e), 'error');
        },
      },
    );
  };

  return { save, pending: create.isPending || add.isPending };
}
