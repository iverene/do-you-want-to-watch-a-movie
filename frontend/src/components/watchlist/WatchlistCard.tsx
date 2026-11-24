import { useState } from 'react';
import { useLogWatch } from '@/app/LogWatchContext';
import { titleMeta } from '@/lib/format';
import { useSession } from '@/queries/auth';
import { useNames } from '@/queries/useNames';
import { useMarkWatched, useRemoveFromWatchlist } from '@/queries/watchlist';
import { errorMessage, type WatchlistItem } from '@/services';
import { Poster } from '../media/Poster';
import { PixelAvatar } from '../pixel/PixelAvatar';
import { useToast } from '../ui/Toast';
import { PlanNight } from './PlanNight';
import { Reactions } from './Reactions';

export function WatchlistCard({ item }: { item: WatchlistItem }) {
  const { user, partner } = useSession();
  const nameOf = useNames();
  const { open } = useLogWatch();
  const toast = useToast();
  const watched = useMarkWatched();
  const remove = useRemoveFromWatchlist();
  const [planning, setPlanning] = useState(false);
  const adder = item.addedBy === user.id ? user : partner;
  const t = item.title;

  return (
    <article
      aria-label={t.title}
      className="flex gap-3 border-b border-dashed border-dot pb-3 lg:flex-col lg:gap-2 lg:border-0 lg:pb-0"
    >
      <Poster
        title={t.title}
        posterUrl={t.posterUrl}
        tintKey={t.id}
        className="w-[84px] lg:w-full"
        decorative
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div>
          <h3 className="truncate text-[14px] font-bold">{t.title}</h3>
          <p className="truncate text-[12px] text-muted">{titleMeta(t, { genre: false })}</p>
          <p className="flex items-center gap-1 whitespace-nowrap font-hand text-[16px] text-muted">
            <PixelAvatar avatar={adder.avatar} scale={2} /> added by {nameOf(item.addedBy)}
          </p>
        </div>
        <Reactions item={item} />
        <div className="flex gap-1">
          <button
            type="button"
            disabled={watched.isPending}
            onClick={() =>
              watched.mutate(
                { id: item.id, body: {} },
                {
                  onSuccess: ({ screening }) => open({ mode: 'rate', screening, justSaved: true }),
                  onError: (e) => toast.show(errorMessage(e), 'error'),
                },
              )
            }
            className="press min-h-9 min-w-0 flex-1 whitespace-nowrap rounded border-2 border-pixel-border bg-orange px-1 text-[12px] font-bold text-pixel-text shadow-bevel max-lg:min-h-11"
          >
            ✓ Watched
          </button>
          <button
            type="button"
            aria-label={`Plan a movie night for ${t.title}`}
            aria-expanded={planning}
            onClick={() => setPlanning((p) => !p)}
            className="bevel min-h-9 w-8 shrink-0 rounded text-[14px] max-lg:min-h-11 max-lg:w-11"
          >
            ✎
          </button>
          <button
            type="button"
            aria-label={`Remove ${t.title} from the watchlist`}
            onClick={() => remove.mutate(item.id)}
            className="bevel min-h-9 w-8 shrink-0 rounded font-caps text-[12px] max-lg:min-h-11 max-lg:w-11"
          >
            x
          </button>
        </div>
        {planning && <PlanNight item={item} onDone={() => setPlanning(false)} />}
      </div>
    </article>
  );
}
