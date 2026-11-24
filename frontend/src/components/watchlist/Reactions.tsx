import { cn } from '@/lib/cn';
import { useSession } from '@/queries/auth';
import { useReact } from '@/queries/watchlist';
import type { Reaction, WatchlistItem } from '@/services';

const OPTIONS: Reaction[] = ['want', 'maybe', 'nah'];

/** My reaction (toggle buttons) and the partner's, shown as text. */
export function Reactions({ item }: { item: WatchlistItem }) {
  const { user, partner } = useSession();
  const react = useReact(user.id);
  const mine = item.reactions.find((r) => r.userId === user.id)?.reaction ?? null;
  const theirs = item.reactions.find((r) => r.userId === partner.id)?.reaction;
  return (
    <div className="flex flex-col gap-1">
      <div role="group" aria-label={`Your reaction to ${item.title.title}`} className="flex gap-1">
        {OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={mine === r}
            onClick={() => react.mutate({ id: item.id, reaction: mine === r ? null : r })}
            className={cn(
              'min-h-8 flex-1 rounded-full border px-2 text-[12px] font-bold max-lg:min-h-11',
              mine === r ? 'border-tab bg-tab text-ontab' : 'border-line bg-paper text-ink',
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <span className="text-[12px] text-muted">
        {partner.displayName}: {theirs ?? 'no reaction yet'}
      </span>
    </div>
  );
}
